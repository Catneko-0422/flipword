// data/topics.ts
export type Vocab = {
  zh: string;     // 中文單字
  en: string;     // 英文單字
  pos: string;    // 詞性
  zhSent: string; // 中文例句
  enSent: string; // 英文例句
};

export type Topic = { slug: string; title: string; words: Vocab[] };


export const TOPICS: Topic[] = [
  {
    slug: "exam-1",
    title: "word bank(exam-1)",
    words: [
      {
        en: "start-up",
        zh: "新創公司",
        pos: "n.",
        enSent: "Jack's small start-up evolved into a successful tech company.",
        zhSent: "傑克的小型新創公司逐漸發展成一家成功的科技公司。"
      },
      {
        en: "specialize",
        zh: "專攻；專門從事",
        pos: "v.",
        enSent: "In most countries' education systems, students specialize more as they get older.",
        zhSent: "在多數國家的教育體系中，學生隨著年齡增長會更趨於專攻。"
      },
      {
        en: "target",
        zh: "鎖定；以…為目標",
        pos: "v.",
        enSent: "The fast-food restaurant targeted young children by offering a free toy.",
        zhSent: "那家速食餐廳透過提供免費玩具，把年幼兒童作為目標。"
      },
      {
        en: "range",
        zh: "範圍；幅度",
        pos: "n.",
        enSent: "Matt is looking to buy a phone in the two- to three-thousand-dollar price range.",
        zhSent: "馬特打算購買一支落在兩到三千美元價位範圍的手機。"
      },
      {
        en: "brand awareness",
        zh: "品牌知名度",
        pos: "n.",
        enSent: "The company invested more money into social media in an attempt to increase brand awareness.",
        zhSent: "該公司投入更多社群媒體的資金，試圖提高品牌知名度。"
      },
      {
        en: "channel",
        zh: "管道；途徑",
        pos: "n.",
        enSent: "Selling online has become very popular, but companies still need to pay close attention to traditional sales channels, too.",
        zhSent: "線上銷售變得很受歡迎，但企業仍須密切注意傳統的銷售管道。"
      },
      {
        en: "promotional",
        zh: "促銷的；宣傳的",
        pos: "adj.",
        enSent: "Our marketing department will create promotional material to advertise the new product.",
        zhSent: "我們的行銷部門會製作宣傳素材來為這項新產品做廣告。"
      },
      {
        en: "campaign",
        zh: "活動；運動",
        pos: "n.",
        enSent: "The government ran a campaign to clean up the city.",
        zhSent: "政府發起了一項清理城市的活動。"
      },
      {
        en: "collaborator",
        zh: "合作者；協作者",
        pos: "n.",
        enSent: "The director thanked the movie's many collaborators in his acceptance speech for the award.",
        zhSent: "導演在上台領獎致詞時感謝了這部電影的眾多合作者。"
      },
      {
        en: "supervise",
        zh: "監督；指導",
        pos: "v.",
        enSent: "All of the workers needed to be supervised closely to make sure things were done safely in the factory.",
        zhSent: "所有工人都需要被緊密監督，以確保工廠內的作業安全。"
      },
      {
        en: "conduct",
        zh: "進行；實施",
        pos: "v.",
        enSent: "The scientists conducted experiments to try and find a cure.",
        zhSent: "科學家們進行了實驗，試圖尋找治療方法。"
      },
      {
        en: "competitive",
        zh: "有競爭力的；競爭性的",
        pos: "adj.",
        enSent: "The product's competitive pricing made it popular with consumers on limited budgets.",
        zhSent: "這款產品具有競爭力的定價，使它在預算有限的消費者之間大受歡迎。"
      }
    ]
  },
];
