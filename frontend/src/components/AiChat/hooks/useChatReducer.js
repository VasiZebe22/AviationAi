// Action types
export const INITIALIZE_START = 'INITIALIZE_START';
export const INITIALIZE_SUCCESS = 'INITIALIZE_SUCCESS';
export const INITIALIZE_ERROR = 'INITIALIZE_ERROR';
export const SET_CHATS = 'SET_CHATS';
export const SET_CURRENT_CHAT = 'SET_CURRENT_CHAT';
export const SET_HISTORY = 'SET_HISTORY';
export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';
export const CLEAR_ERROR = 'CLEAR_ERROR';
export const SET_MESSAGE_INPUT = 'SET_MESSAGE_INPUT';
export const SET_IS_TYPING = 'SET_IS_TYPING';
export const SET_DISPLAYED_CONTENT = 'SET_DISPLAYED_CONTENT';
export const SET_SHOW_STARRED_CHATS_ONLY = 'SET_SHOW_STARRED_CHATS_ONLY';
export const SET_SHOW_BOOKMARKED_MESSAGES_ONLY = 'SET_SHOW_BOOKMARKED_MESSAGES_ONLY';
export const NEW_CHAT = 'NEW_CHAT';
export const ADD_MESSAGE = 'ADD_MESSAGE';
export const UPDATE_MESSAGE = 'UPDATE_MESSAGE';
export const TOGGLE_BOOKMARK = 'TOGGLE_BOOKMARK';
export const TOGGLE_STAR = 'TOGGLE_STAR';
export const SET_EDITING_CHAT_ID = 'SET_EDITING_CHAT_ID';
export const SET_NEW_TITLE = 'SET_NEW_TITLE';
export const UPDATE_CHAT_TITLE = 'UPDATE_CHAT_TITLE';
export const DELETE_CHAT = 'DELETE_CHAT';
export const SET_NETWORK_STATUS = 'SET_NETWORK_STATUS';

// Initial state
export const initialState = {
  isInitializing: true,
  isFirestoreConnected: true,
  firestoreError: null,
  savedChats: [],
  currentChat: null,
  history: [],
  isLoading: false,
  error: null,
  messageInput: '',
  isTyping: false,
  displayedContent: '',
  showStarredChatsOnly: false,
  showBookmarkedMessagesOnly: false,
  editingChatId: null,
  newTitle: '',
  chatId: null,
  forceUpdate: 0
};

/**
 * Reducer function for chat state
 * 
 * @param {Object} state - Current state
 * @param {Object} action - Action to perform
 * @returns {Object} New state
 */
export const chatReducer = (state, action) => {
  switch (action.type) {
    case INITIALIZE_START:
      return {
        ...state,
        isInitializing: true
      };
    case INITIALIZE_SUCCESS:
      return {
        ...state,
        isInitializing: false,
        isFirestoreConnected: true,
        firestoreError: null
      };
    case INITIALIZE_ERROR:
      return {
        ...state,
        isInitializing: false,
        isFirestoreConnected: false,
        firestoreError: action.payload,
        error: action.payload
      };
    case SET_CHATS:
      return {
        ...state,
        savedChats: action.payload
      };
    case SET_CURRENT_CHAT:
      return {
        ...state,
        currentChat: action.payload,
        chatId: action.payload?.id || null
      };
    case SET_HISTORY:
      return {
        ...state,
        history: action.payload,
        currentChat: state.currentChat ? {
          ...state.currentChat,
          messages: action.payload
        } : null
      };
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    case SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
    case CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case SET_MESSAGE_INPUT:
      return {
        ...state,
        messageInput: action.payload
      };
    case SET_IS_TYPING:
      return {
        ...state,
        isTyping: action.payload
      };
    case SET_DISPLAYED_CONTENT:
      return {
        ...state,
        displayedContent: action.payload
      };
    case SET_SHOW_STARRED_CHATS_ONLY:
      return {
        ...state,
        showStarredChatsOnly: action.payload
      };
    case SET_SHOW_BOOKMARKED_MESSAGES_ONLY:
      return {
        ...state,
        showBookmarkedMessagesOnly: action.payload
      };
    case NEW_CHAT:
      return {
        ...state,
        currentChat: null,
        history: [],
        messageInput: '',
        error: null,
        isTyping: false,
        displayedContent: '',
        chatId: null
      };
    case ADD_MESSAGE:
      return {
        ...state,
        history: [...state.history, action.payload]
      };
    case UPDATE_MESSAGE:
      return {
        ...state,
        history: state.history.map((msg, index) => 
          index === action.payload.index ? { ...msg, ...action.payload.updates } : msg
        )
      };
    case TOGGLE_BOOKMARK:
      const updatedHistory = [...state.history];
      updatedHistory[action.payload] = {
        ...updatedHistory[action.payload],
        bookmarked: !updatedHistory[action.payload].bookmarked
      };
      return {
        ...state,
        history: updatedHistory,
        currentChat: state.currentChat ? {
          ...state.currentChat,
          messages: updatedHistory
        } : null
      };
    case TOGGLE_STAR:
      return {
        ...state,
        currentChat: state.currentChat ? {
          ...state.currentChat,
          starred: !state.currentChat.starred
        } : null,
        savedChats: state.savedChats.map(chat => 
          chat.id === state.currentChat?.id 
            ? { ...chat, starred: !chat.starred }
            : chat
        )
      };
    case SET_EDITING_CHAT_ID:
      return {
        ...state,
        editingChatId: action.payload
      };
    case SET_NEW_TITLE:
      return {
        ...state,
        newTitle: action.payload
      };
    case UPDATE_CHAT_TITLE:
      return {
        ...state,
        savedChats: state.savedChats.map(chat => 
          chat.id === action.payload.chatId
            ? { ...chat, title: action.payload.title }
            : chat
        ),
        currentChat: state.currentChat?.id === action.payload.chatId
          ? { ...state.currentChat, title: action.payload.title }
          : state.currentChat,
        editingChatId: null,
        newTitle: ''
      };
    case DELETE_CHAT:
      return {
        ...state,
        savedChats: state.savedChats.filter(chat => chat.id !== action.payload),
        currentChat: state.currentChat?.id === action.payload ? null : state.currentChat,
        history: state.currentChat?.id === action.payload ? [] : state.history,
        chatId: state.currentChat?.id === action.payload ? null : state.chatId
      };
    case SET_NETWORK_STATUS:
      return {
        ...state,
        isFirestoreConnected: action.payload.isOnline,
        firestoreError: action.payload.isOnline ? null : 'You are currently offline. Please check your internet connection.'
      };
    default:
      return state;
  }
};