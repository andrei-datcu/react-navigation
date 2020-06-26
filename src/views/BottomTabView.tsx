import * as React from 'react';
import { View, StyleSheet } from 'react-native';

import {
  NavigationHelpersContext,
  TabNavigationState,
  useTheme,
} from '@react-navigation/native';
// eslint-disable-next-line import/no-unresolved

import ResourceSavingScene from './ResourceSavingScene';
import type {
  BottomTabNavigationConfig,
  BottomTabDescriptorMap,
  BottomTabNavigationHelpers,
} from '../types';

type Props = BottomTabNavigationConfig & {
  state: TabNavigationState;
  navigation: BottomTabNavigationHelpers;
  descriptors: BottomTabDescriptorMap;
};

type State = {
  loaded: number[];
};

function SceneContent({
  isFocused,
  children,
}: {
  isFocused: boolean;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View
      accessibilityElementsHidden={!isFocused}
      importantForAccessibility={isFocused ? 'auto' : 'no-hide-descendants'}
      style={[styles.content, { backgroundColor: colors.background }]}
    >
      {children}
    </View>
  );
}

export default class BottomTabView extends React.Component<Props, State> {
  static defaultProps = {
    lazy: true,
  };

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const { index } = nextProps.state;

    return {
      // Set the current tab to be loaded if it was not loaded before
      loaded: prevState.loaded.includes(index)
        ? prevState.loaded
        : [...prevState.loaded, index],
    };
  }

  state = {
    loaded: [this.props.state.index],
  };

  private renderTabBar = () => {
    const {
      tabBar = () => <View/>,
      tabBarOptions,
      state,
      navigation,
      descriptors,
    } = this.props;
    return tabBar({
      ...tabBarOptions,
      state: state,
      descriptors: descriptors,
      navigation: navigation,
    });
  };

  render() {
    const { state, descriptors, navigation, lazy, containerStyle } = this.props;
    const { routes } = state;
    const { loaded } = this.state;

    return (
      <NavigationHelpersContext.Provider value={navigation}>
          <View style={[styles.container, containerStyle]}>
            <View style={styles.pages}>
              {routes.map((route, index) => {
                const descriptor = descriptors[route.key];
                const { unmountOnBlur } = descriptor.options;
                const isFocused = state.index === index;

                if (unmountOnBlur && !isFocused) {
                  return null;
                }

                if (lazy && !loaded.includes(index) && !isFocused) {
                  // Don't render a screen if we've never navigated to it
                  return null;
                }

                return (
                  <ResourceSavingScene
                    key={route.key}
                    style={StyleSheet.absoluteFill}
                    isVisible={isFocused}
                  >
                    <SceneContent isFocused={isFocused}>
                      {descriptor.render()}
                    </SceneContent>
                  </ResourceSavingScene>
                );
              })}
            </View>
            {this.renderTabBar()}
          </View>
      </NavigationHelpersContext.Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  pages: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
