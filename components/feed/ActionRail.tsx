import React from 'react';
import { View, Pressable, Text, StyleSheet, ActionSheetIOS, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type Props = {
  isSaved: boolean;
  isFollowing: boolean;
  onToggleSave: () => void;
  onToggleFollow: () => void;
  onShare: () => void;
  onNotInterested: () => void;
  onReport: () => void;
  onViewSources: () => void;
};

export function ActionRail({
  isSaved,
  isFollowing,
  onToggleSave,
  onToggleFollow,
  onShare,
  onNotInterested,
  onReport,
  onViewSources,
}: Props) {
  const openMore = () => {
    const options = ['Not interested', 'Report', 'View sources', 'Cancel'];
    const handlers = [onNotInterested, onReport, onViewSources];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: options.length - 1 },
        (index) => {
          if (index < handlers.length) handlers[index]();
        }
      );
    } else {
      Alert.alert('More', undefined, [
        { text: 'Not interested', onPress: onNotInterested },
        { text: 'Report', onPress: onReport },
        { text: 'View sources', onPress: onViewSources },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const press = (fn: () => void) => () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    fn();
  };

  return (
    <View style={styles.rail}>
      <RailButton
        icon={isSaved ? 'bookmark' : 'bookmark-outline'}
        label="Save"
        active={isSaved}
        onPress={press(onToggleSave)}
      />
      <RailButton icon="share-outline" label="Share" onPress={press(onShare)} />
      <RailButton
        icon={isFollowing ? 'checkmark-circle' : 'add-circle-outline'}
        label={isFollowing ? 'Following' : 'Follow'}
        active={isFollowing}
        onPress={press(onToggleFollow)}
      />
      <RailButton icon="ellipsis-horizontal-circle-outline" label="More" onPress={openMore} />
    </View>
  );
}

function RailButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
    >
      <Ionicons name={icon} size={26} color={active ? '#60A5FA' : '#FFFFFF'} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rail: { position: 'absolute', right: 12, bottom: 140, alignItems: 'center', gap: 22 },
  button: { alignItems: 'center', gap: 4 },
  label: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
