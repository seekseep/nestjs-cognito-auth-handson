import { Controller } from '@nestjs/common';
import { openDatabase } from '../database.js';

@Controller('notes')
export class NotesController {
  private readonly db = openDatabase();
}
