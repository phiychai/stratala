import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import { DateTime } from 'luxon';
import User from './user.js';

export default class ContentView extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare contentType: 'post' | 'video';

  @column()
  declare contentId: string; // Payload ID as string

  @column()
  declare userId: number | null; // Nullable for anonymous views

  @column()
  declare ipAddress: string | null; // For anonymous views

  @column.dateTime()
  declare viewedAt: DateTime;

  // Relationships
  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User> | null;
}

