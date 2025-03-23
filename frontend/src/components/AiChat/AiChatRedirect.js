/**
 * AiChat Compatibility Layer
 * 
 * This file serves as a bridge between the old monolithic AiChat component
 * and the new modular implementation. It allows for a phased migration
 * where existing code can continue to import from the original location
 * while we benefit from the improved architecture internally.
 * 
 * Following SOLID principles, the component has been broken down into:
 * - Smaller UI components with single responsibilities
 * - Custom hooks for state management and logic
 * - Utility functions for common operations
 */

import AiChat from './components/AiChat';
export default AiChat;
