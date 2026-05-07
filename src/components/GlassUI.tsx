import React from 'react';
import { motion } from 'motion/react';

export const GlassCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  variant?: 'cyberpunk' | 'minimal' | 'void'
}> = ({ children, className, variant = 'cyberpunk' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-white border-slate-200 shadow-sm shadow-slate-200/50';
      case 'void':
        return 'bg-zinc-900/50 border-zinc-800 shadow-none';
      default:
        return 'bg-white/5 backdrop-blur-3xl border-white/[0.08] shadow-2xl shadow-black/40';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${getVariantStyles()} rounded-[32px] p-6 relative overflow-hidden transition-all duration-700 ${className}`}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export const GEN_EMOJIS = [
  // Faces & Expressions
  '😀', '😂', '🫠', '🙃', '😉', '🥰', '😍', '🤩', '😘', '😋', '😛', '🤫', '🤔', '🤨', '😐', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😴', '🤢', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮', '😳', '🥺', '🥹', '😦', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖',
  // Hearts & Hands
  '🫶', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '🫦', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟',
  // Nature & Space
  '🧠', '⚡', '🌌', '🧬', '🔋', '🔮', '🛰️', '🪐', '☄️', '🌀', '💎', '🔥', '💧', '🌿', '🌬️', '☀️', '🌙', '⭐', '🌈', '🛸', '🚀', '🔭', '🔬', '🌍', '🌋', '🌊', '❄️', '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🪨', '🪵',
  // Animals
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔',
  // Food & Drink
  '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥣', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🧂', '🍩', '🍪', '🌰', '🥜', '🥤', '🧋', '🧃', '🧉', '🍵', '☕', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊',
  // Activities & Objects
  '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏹', '🎣', '🤿', '🥊', '🥋', '⛸️', '🎿', '🛷', '🥌', '🎯', '🪗', '🎮', '🕹️', '🎰', '🎲', '🧩', '🧸', '🪅', '🪩', '🪆', '🎨', '🎭', '🧵', '🪡', '🧶', '🎸', '🎹', '🎺', '🎻', '🥁', '🪘', '📱', '💻', '⌨️', '🖱️', '🖨️', '🖥️', '💿', '💾', '📸', '📹', '🎥', '📽️', '📼', '🔍', '💡', '🔦', '🏮', '🪪', '📓', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🔗', '📎', '🖇️', '📐', '📏', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝️', '🔨', '🛠️', '⚒️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧫', '🧬', '🌡️', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🧽', '🪣', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🖼️', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🧧', '✉️', '📩', '📨', '📧', '💌', '📮', '📪', '📫', '📬', '📭', '📦', '🗳️'
];

export const AppleEmoji: React.FC<{ emoji: string; size?: number; className?: string }> = ({ emoji, size = 32, className }) => {
  // Using a CDN that provides Apple emojis specifically
  const codePoint = [...emoji].map(char => char.codePointAt(0)?.toString(16)).join('-');
  const src = `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${codePoint}.png`;
  
  return (
    <img 
      src={src} 
      alt={emoji} 
      style={{ 
        width: size, 
        height: size,
        minWidth: size,
        minHeight: size,
        filter: 'saturate(1.5) contrast(1.1) drop-shadow(0 1px 2px rgba(0,0,0,0.1))' 
      }}
      className={`inline-block align-middle object-contain object-center aspect-square shrink-0 mx-1 ${className}`}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        const span = document.createElement('span');
        span.innerText = emoji;
        span.className = 'font-black inline-block align-baseline';
        span.style.fontSize = `${size}px`;
        e.currentTarget.parentNode?.appendChild(span);
      }}
    />
  );
};

export const EmojiText: React.FC<{ text: string; size?: number; className?: string }> = ({ text, size, className }) => {
  // Regex to match emojis
  const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
  
  const parts = text.split(emojiRegex);
  
  // Check if text is ONLY emojis (excluding whitespace)
  const onlyEmojis = text.replace(emojiRegex, '').trim().length === 0 && text.match(emojiRegex);
  const emojiCount = (text.match(emojiRegex) || []).length;
  
  // Determine jumbo size if only emojis
  const isJumbo = onlyEmojis && emojiCount <= 3;
  const displaySize = size || (isJumbo ? 48 : 20);

  return (
    <span className={`${className} ${isJumbo ? 'flex gap-2 py-2' : ''}`}>
      {parts.map((part, i) => {
        if (emojiRegex.test(part)) {
          return <AppleEmoji key={i} emoji={part} size={displaySize} className={isJumbo ? 'mx-0' : ''} />;
        }
        return part;
      })}
    </span>
  );
};
