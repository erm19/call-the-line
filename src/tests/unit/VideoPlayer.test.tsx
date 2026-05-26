import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { VideoPlayer } from '@presentation/components/VideoPlayer/VideoPlayer';

jest.mock('@presentation/i18n', () => ({
  t: (key: string) => key,
}));

describe('VideoPlayer', () => {
  describe('when rendering placeholder content', () => {
    it('should render the comingSoon i18n key', () => {
      const { getByText } = render(<VideoPlayer uri="file:///tmp/clip.mp4" />);

      expect(getByText('videoPlayer.comingSoon')).toBeTruthy();
    });

    it('should render the provided uri', () => {
      const { getByText } = render(<VideoPlayer uri="file:///tmp/clip.mp4" />);

      expect(getByText('file:///tmp/clip.mp4')).toBeTruthy();
    });
  });

  describe('close button visibility', () => {
    it('should render the close button when onClose is provided', () => {
      const { getByTestId, getByText } = render(
        <VideoPlayer uri="file:///tmp/clip.mp4" onClose={jest.fn()} />,
      );

      expect(getByTestId('video-player-close')).toBeTruthy();
      expect(getByText('videoPlayer.close')).toBeTruthy();
    });

    it('should hide the close button when onClose is undefined', () => {
      const { queryByTestId } = render(<VideoPlayer uri="file:///tmp/clip.mp4" />);

      expect(queryByTestId('video-player-close')).toBeNull();
    });
  });

  describe('when the close button is pressed', () => {
    it('should call onClose', () => {
      const onClose = jest.fn();
      const { getByTestId } = render(<VideoPlayer uri="file:///tmp/clip.mp4" onClose={onClose} />);

      fireEvent.press(getByTestId('video-player-close'));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
