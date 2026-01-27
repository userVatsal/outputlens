/**
 * Neural Database Index
 * 
 * Re-exports all neural database functionality
 */

export { 
  type RegimeEmbedding,
  createEmbeddingVector,
  createEmbeddingFromSimulation,
  validateEmbedding,
  describeEmbedding,
  EMBEDDING_DIMENSIONS
} from './embeddings';

export {
  cosineSimilarity,
  euclideanDistance,
  findSimilarRegimes,
  describeSimilarity,
  getWeightedHistoricalOutcome,
  type SimilarityResult
} from './similarity';

export {
  queryNeuralContext,
  getQuickContext,
  type NeuralContext
} from './query';
