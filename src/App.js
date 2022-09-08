import React from 'react';

import { usePandaBridge } from 'pandasuite-bridge-react';
import PandaBridge from 'pandasuite-bridge';
import ReactCompareImage from './components/ReactCompareImage';

let lastPosition = 0.5;

const isValueInRange = (testValue, currentValue, oldValue, minBorder, maxBorder) => {
  const minvalue = Math.min(oldValue, currentValue);
  const maxvalue = Math.max(oldValue, currentValue);

  const isLooping = (Math.abs(oldValue - currentValue) > (maxBorder - minBorder) * 0.85)
    && oldValue !== -1;
  return ((isLooping && ((testValue > maxvalue && testValue <= maxBorder)
      || (testValue >= minBorder && testValue <= minvalue)))
    || (!isLooping && ((oldValue <= currentValue && (testValue > minvalue && testValue <= maxvalue))
      || (oldValue > currentValue && (testValue >= minvalue && testValue < maxvalue)))));
};

function App() {
  const [currentPosition, setCurrentPosition] = React.useState(0.5);
  const { properties, markers } = usePandaBridge(
    {
      markers: {
        getSnapshotDataHook: () => ({ id: currentPosition }),
        setSnapshotDataHook: ({ data }) => {
          if (data && data.id) {
            setCurrentPosition(parseFloat(data.id));
          }
        },
      },
      synchronization: {
        position: (percent) => {
          setCurrentPosition(percent / 100);
        },
      },
    },
  );

  if (!properties) {
    return null;
  }

  const {
    vertical, sliderLineColor, sliderLineWidth, handle,
  } = properties;

  const triggerMarkers = (position) => {
    if (markers && markers.length > 0) {
      markers.forEach((marker) => {
        if (isValueInRange(parseFloat(marker.id), parseFloat(position), parseFloat(lastPosition))) {
          PandaBridge.send('triggerMarker', marker.id);
        }
      });
    }
  };

  const onSliderPositionChange = (position) => {
    triggerMarkers(position);
    PandaBridge.send('synchronize', [position * 100, 'position', true]);
    lastPosition = position;
    setCurrentPosition(position);
  };

  // if (currentPosition !== lastPosition) {
  //   lastPosition = currentPosition - 0.0001;
  //   triggerMarkers(currentPosition);
  // }

  return (
    <ReactCompareImage
      leftImage={PandaBridge.resolvePath('left.png')}
      rightImage={PandaBridge.resolvePath('right.png')}
      sliderLineColor={sliderLineColor || '#FFFFFF'}
      sliderLineWidth={sliderLineWidth}
      handle={handle ? undefined : <></>}
      vertical={vertical}
      onSliderPositionChange={onSliderPositionChange}
      onStartSliding={() => PandaBridge.send('onDragStart')}
      onEndSliding={() => PandaBridge.send('onDragEnd')}
      sliderPositionPercentage={currentPosition}
      aspectRatio="taller"
    />
  );
}

export default App;
