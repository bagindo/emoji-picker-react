import clsx from 'clsx';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { DataEmoji } from '../../dataUtils/DataTypes';
import {
  emojiByUnified,
  emojiHasVariations,
  emojiName,
  emojiNames
  // emojiUrlByUnified
} from '../../dataUtils/emojiSelectors';
import { parseNativeEmoji } from '../../dataUtils/parseNativeEmoji';
import { EmojiStyle } from '../../types/exposedTypes';
import { Button } from '../atoms/Button';
import { useEmojisThatFailedToLoadState } from '../context/PickerContext';
import './Emoji.css';
import './Sprites.css';

type ClickableEmojiProps = Readonly<
  BaseProps & {
    hidden?: boolean;
    showVariations?: boolean;
    hiddenOnSearch?: boolean;
    emoji: DataEmoji;
  }
>;

type BaseProps = {
  emoji?: DataEmoji;
  emojiStyle: EmojiStyle;
  unified: string;
  size?: number;
  lazyLoad?: boolean;
  getEmojiUrl?: GetEmojiUrl;
};

export function ClickableEmoji({
  emoji,
  unified,
  hidden,
  hiddenOnSearch,
  emojiStyle,
  // @ts-ignore
  showVariations = true,
  size,
  lazyLoad,
  getEmojiUrl
}: ClickableEmojiProps) {
  // @ts-ignore
  const hasVariations = emojiHasVariations(emoji);

  return (
    <Button
      className={clsx(ClassNames.emoji, {
        [ClassNames.hidden]: hidden,
        [ClassNames.hiddenOnSearch]: hiddenOnSearch,
        [ClassNames.visible]: !hidden && !hiddenOnSearch
        // [ClassNames.emojiHasVariations]: hasVariations && showVariations
      })}
      data-unified={unified}
      // @ts-ignore - let's ignore the fact this is not a real react ref, ok?
      aria-label={emojiName(emoji)}
      data-full-name={emojiNames(emoji)}
    >
      <ViewOnlyEmoji
        unified={unified}
        emoji={emoji}
        size={size}
        emojiStyle={emojiStyle}
        lazyLoad={lazyLoad}
        getEmojiUrl={getEmojiUrl}
      />
    </Button>
  );
}

interface CustomCSS extends React.CSSProperties {
  '--epr-emoji-size': string;
}

export function ViewOnlyEmoji({
  emoji,
  unified,
  emojiStyle,
  size
}: // lazyLoad,
// getEmojiUrl = emojiUrlByUnified
BaseProps) {
  const style = {} as CustomCSS;
  if (size) {
    style.width = style.height = style.fontSize = `${size}px`;
    style['--epr-emoji-size'] = `${size}px`;
  }

  const emojiToRender = emoji ? emoji : emojiByUnified(unified);
  if (!emojiToRender) {
    return null;
  }

  return (
    <>
      {emojiStyle === EmojiStyle.NATIVE ? (
        <NativeEmoji unified={unified} style={style} />
      ) : (
        <EmojiImgSprite unified={unified} style={style} />
        // <EmojiImg
        //   unified={unified}
        //   style={style}
        //   emoji={emojiToRender}
        //   emojiStyle={emojiStyle}
        //   lazyLoad={lazyLoad}
        //   getEmojiUrl={getEmojiUrl}
        // />
      )}
    </>
  );
}

function NativeEmoji({
  unified,
  style
}: {
  unified: string;
  style: React.CSSProperties;
}) {
  return (
    <span
      className={clsx(ClassNames.external, 'epr-emoji-native')}
      data-unified={unified}
      style={style}
    >
      {parseNativeEmoji(unified)}
    </span>
  );
}

function EmojiImgSprite({
  unified,
  style
}: {
  unified: string;
  style: React.CSSProperties;
}) {
  const [, setEmojisThatFailedToLoad] = useEmojisThatFailedToLoadState();

  return (
    <div
      className={clsx(ClassNames.external, `epr-emoji-img e${unified}`)}
      onError={onError}
      style={style}
    />
  );

  function onError() {
    setEmojisThatFailedToLoad(prev => new Set(prev).add(unified));
  }
}

// function EmojiImg({
//   emoji,
//   unified,
//   emojiStyle,
//   style,
//   lazyLoad = false,
//   getEmojiUrl
// }: {
//   emoji: DataEmoji;
//   unified: string;
//   emojiStyle: EmojiStyle;
//   style: React.CSSProperties;
//   lazyLoad?: boolean;
//   getEmojiUrl: GetEmojiUrl;
// }) {
//   const [, setEmojisThatFailedToLoad] = useEmojisThatFailedToLoadState();

//   return (
//     <img
//       src={getEmojiUrl(unified, emojiStyle)}
//       alt={emojiName(emoji)}
//       className={clsx(ClassNames.external, 'epr-emoji-img')}
//       loading={lazyLoad ? 'lazy' : 'eager'}
//       onError={onError}
//       style={style}
//     />
//   );

//   function onError() {
//     setEmojisThatFailedToLoad(prev => new Set(prev).add(unified));
//   }
// }

export type GetEmojiUrl = (unified: string, style: EmojiStyle) => string;
