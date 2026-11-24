export type {
  CursorPaginatedResult,
  IdentifiableEntity,
  IsoTimestamp,
  TenantScoped,
  TenantScopedEntity,
  Ulid,
  UuidV7,
} from "./primitives.contracts.js";

export {
  PROBLEM_CODES,
  type ProblemCode,
  type ProblemDetails,
  type ValidationErrorItem,
} from "./problem-details.contracts.js";

export {
  ACADEMIC_SYSTEM_ROLES,
  PRESENCE_STATUSES,
  type AcademicSystemRole,
  type AuthenticatedSession,
  type AuthorSummary,
  type CampusSummary,
  type InstitutionSummary,
  type PresenceStatus,
  type TeacherProfileSummary,
} from "./tenant-auth.contracts.js";

export {
  CHANNEL_TYPES,
  type ChannelCategorySummary,
  type ChannelPermissionFlags,
  type ChannelSummary,
  type ChannelType,
} from "./workspace-channel.contracts.js";

export {
  MESSAGE_EMBED_KINDS,
  type AttachmentMetadata,
  type MessageEmbedKind,
  type MessageEmbedPayload,
  type MessageReactionSummary,
  type MessageSummary,
  type ThreadSummary,
} from "./messaging.contracts.js";

export type {
  ChatMessageSendPayload,
  ClientToServerEvents,
  HandRaisePayload,
  PresenceHeartbeatPayload,
  PresenceUpdatedPayload,
  ServerToClientEvents,
  TypingBroadcastPayload,
  MessageDeletedPayload,
  TypingSignalPayload,
  VoiceParticipantSnapshot,
  VoiceRoomStatePayload,
  VoiceStateFlags,
} from "./realtime-events.contracts.js";
