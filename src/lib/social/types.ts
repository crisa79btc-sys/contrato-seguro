/**
 * Tipos do módulo de automação de redes sociais.
 */

export type PostCategory =
  | 'aluguel'
  | 'trabalho'
  | 'servico'
  | 'compra_venda'
  | 'consumidor'
  | 'digital'
  | 'geral';

export type PostType =
  | 'dica'
  | 'mito_verdade'
  | 'checklist'
  | 'estatistica'
  | 'pergunta'
  | 'caso_real';

export type TopicTemplate = {
  key: string;
  category: PostCategory;
  type: PostType;
  promptHint: string;
};

export type GeneratedPost = {
  text: string;
  hashtags: string[];
  imageHeadline: string;
};

/** Dados de um slide individual para carrossel */
export type CarouselSlide = {
  title: string;
  description: string;
  law: string;
};

/** Post completo em formato carrossel */
export type CarouselPost = {
  caption: string;
  coverTitle: string;
  coverSubtitle: string;
  slides: CarouselSlide[];
  imageHeadline: string;
};

export type PostHistoryEntry = {
  date: string;
  topicKey: string;
  postType?: string;
  fbPostId?: string;
  igPostId?: string;
  error?: string;
};

export type MetaPostResult = {
  id: string;
  success: boolean;
  error?: string;
};

export type SocialPostResult = {
  success: boolean;
  id?: string;
  error?: string;
};

export type OrchestratorResult = {
  success: boolean;
  topicKey: string;
  facebook?: MetaPostResult;
  instagram?: MetaPostResult;
  threads?: SocialPostResult;
  telegram?: SocialPostResult;
  linkedin?: SocialPostResult;
  tiktok?: SocialPostResult;
  newsletter?: SocialPostResult;
  error?: string;
};
