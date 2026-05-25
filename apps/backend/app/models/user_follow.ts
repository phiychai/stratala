import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';

import User from './user.js';

import type { BelongsTo } from '@adonisjs/lucid/types/relations';

export default class UserFollow extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare userId: number;

  @column()
  declare spaceId: string; // Payload tenant/space ID as string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null;

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>;
}
