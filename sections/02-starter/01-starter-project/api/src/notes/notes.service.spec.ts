import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service.js';

describe('NotesService', () => {
  let service: NotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotesService],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('作ったメモが一覧に出る', () => {
    service.create({ title: '買い物', body: '牛乳' });
    expect(service.findAll().map((n) => n.title)).toEqual(['買い物']);
  });

  it('消したメモは取得できない', () => {
    const note = service.create({ title: '買い物', body: '' });
    service.remove(note.id);
    expect(() => service.findOne(note.id)).toThrow(NotFoundException);
  });
});
