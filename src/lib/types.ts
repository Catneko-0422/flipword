export type Word = {
  id: string;
  en: string;
  zh: string;
  pos: string;
  enSent: string;
  zhSent: string;
};

export type WordInput = Omit<Word, "id">;

export type WordUpdate = {
  id: string;
} & Partial<WordInput>;

export type Topic = {
  slug: string;
  title: string;
  words: Word[];
};

export type TopicsDocument = {
  topics: Topic[];
};

export type SessionTokenPayload = {
  sub: "admin";
  iat: number;
  exp: number;
};