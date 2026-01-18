import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import { DateTime } from 'luxon';
import User from './user.js';

export default class ContentLike extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare contentType: 'post' | 'video';

  @column()
  declare contentId: string; // Payload ID as string

  @column()
  declare userId: number;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null;

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>;
}

