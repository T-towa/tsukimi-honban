import React, { useEffect, useRef } from 'react';
import './ChallengesExperience.css';

const ChallengesExperience = () => {
  const starsContainerRef = useRef(null);

  useEffect(() => {
    // 星の装飾を生成
    const generateStars = () => {
      const container = starsContainerRef.current;
      if (!container) return;

      const starCount = 30;
      const starImages = [
        '/picture/star1.svg',
        '/picture/star2.svg',
        '/picture/star3.svg'
      ];

      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('img');
        star.src = starImages[i % starImages.length];
        star.className = 'star';

        // ランダムな位置とサイズ
        const size = Math.random() * 20 + 15; // 15-35px
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 2500}px`;
        star.style.setProperty('--rotation', `${Math.random() * 360}deg`);

        container.appendChild(star);
      }
    };

    generateStars();

    // クリーンアップ
    return () => {
      if (starsContainerRef.current) {
        starsContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  const challenges = [
    {
      id: 1,
      title: '仏の御石の鉢',
      image: '/picture/IMG_1152 2.jpg',
      alt: '仏の御石の鉢',
      descriptions: [
        { text: '仏の御石に星の種が', lineClass: 'line-5' },
        { text: '落ちてきました', lineClass: 'line-6' },
        { text: '鉢の不思議な力で花は', lineClass: 'line-4' },
        { text: '星屑のように煌めいてます', lineClass: 'line-3' },
        { text: '月灯を近づけて不思議な', lineClass: 'line-1' },
        { text: '力を受けとりましょう', lineClass: 'line-2' }
      ]
    },
    {
      id: 2,
      title: '蓬莱の玉の枝',
      image: '/picture/IMG_8696.png',
      alt: '蓬莱の玉の枝',
      descriptions: [
        { text: '悪戯好きの月兎によって', lineClass: 'line-5' },
        { text: '蓬莱の玉の枝が分かれて', lineClass: 'line-6' },
        { text: '正しい姿に戻し', lineClass: 'line-3' },
        { text: 'ましょう', lineClass: 'line-4' },
        { text: '不思議な力を', lineClass: 'line-1' },
        { text: '受けとりましょう', lineClass: 'line-2' }
      ]
    },
    {
      id: 3,
      title: '火鼠の皮衣',
      image: '/picture/皮衣.png',
      alt: '火鼠の皮衣',
      descriptions: [
        { text: '火鼠の皮衣が何者かに', lineClass: 'line-5' },
        { text: '盗まれてしまいました', lineClass: 'line-4' },
        { text: '盗人の後ろからこっそり', lineClass: 'line-3' },
        { text: '月灯をあてて皮衣を', lineClass: 'line-1' },
        { text: '探しましょう', lineClass: 'line-2' }
      ]
    },
    {
      id: 4,
      title: '龍の頸の玉',
      image: '/picture/IMG_1186.jpg',
      alt: '龍の頸の玉',
      descriptions: [
        { text: '玉の本来の持ち主である', lineClass: 'line-5' },
        { text: '龍が玉を探しに会場へ', lineClass: 'line-6' },
        { text: 'やってきました', lineClass: 'line-7' },
        { text: '龍を恐れぬ勇気があれば', lineClass: 'line-4' },
        { text: '龍の怒りを鎮められます', lineClass: 'line-3' },
        { text: '勇気が認められれば玉と', lineClass: 'line-2' },
        { text: '共に力を授かれます', lineClass: 'line-1' }
      ]
    },
    {
      id: 5,
      title: '燕の子安貝',
      image: '/picture/子安貝.png',
      alt: '燕の子安貝',
      descriptions: [
        { text: '昔から安産と幸福の象徴', lineClass: 'line-6' },
        { text: 'である燕の小安貝', lineClass: 'line-7' },
        { text: '貸していたヤドカリから', lineClass: 'line-5' },
        { text: '返してもらいましょう', lineClass: 'line-4' },
        { text: 'どうやら砂に埋もれてしまった', lineClass: 'line-2' },
        { text: 'ようなので砂をかき分けて', lineClass: 'line-3' },
        { text: '貝を見つけましょう', lineClass: 'line-1' }
      ]
    }
  ];

  return (
    <div className="challenges-container">
      {/* Background Images */}
      <img className="bg-header-image-left" src="/picture/Rectangle 21.svg" alt="" />

      {/* Page Title */}
      <h1 className="challenges-page-title">五つの無理難題</h1>

      {/* Challenge Cards */}
      {challenges.map((challenge) => (
        <div
          key={challenge.id}
          className={`challenge challenge-${challenge.id}`}
          data-challenge={challenge.id}
        >
          <div className="challenge-content-group">
            <img
              className="challenge-image"
              src={challenge.image}
              alt={challenge.alt}
            />
            <h2 className="challenge-title">{challenge.title}</h2>
          </div>
          <div className="challenge-description">
            {challenge.descriptions.map((desc, index) => (
              <p key={index} className={`desc-line ${desc.lineClass}`}>
                {desc.text}
              </p>
            ))}
          </div>
        </div>
      ))}

      {/* CTA Buttons Bottom */}
      <div className="cta-buttons-bottom">
        <a href="/" className="cta-button">
          <span className="cta-text">トップ</span>
          <span className="cta-arrow">▷▷</span>
        </a>
        <a href="/flow" className="cta-button cta-button-wide">
          <span className="cta-text">体験の流れ</span>
          <span className="cta-arrow">▷▷</span>
        </a>
      </div>

      {/* Decorative Stars Container */}
      <div ref={starsContainerRef} id="stars-container"></div>

      {/* Footer */}
      <footer className="challenges-footer">
        <img className="footer-logo" src="/picture/LOGO.png" alt="Logo" />
        <p className="footer-text">©金澤月見光路　出原研究室　月に詠む</p>
      </footer>
    </div>
  );
};

export default ChallengesExperience;
