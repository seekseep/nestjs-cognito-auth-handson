import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { User } from '../auth/user.js';
import { NotesService } from './notes.service.js';

// テスト用のユーザー。認可の判定に使う sub と cognito:groups だけを持たせる。
const alice = { sub: 'alice' } as User;
const bob = { sub: 'bob' } as User;
const admin = { sub: 'admin', 'cognito:groups': ['admin'] } as User;

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

  it('作った人が持ち主になる', () => {
    const note = service.create({ title: '買い物', body: '' }, alice);
    expect(note.ownerId).toBe('alice');
  });

  it('一覧には自分のメモだけが出る', () => {
    service.create({ title: 'alice のメモ', body: '' }, alice);
    service.create({ title: 'bob のメモ', body: '' }, bob);
    expect(service.findAll(alice).map((n) => n.title)).toEqual([
      'alice のメモ',
    ]);
  });

  it('admin の一覧には全員のメモが出る', () => {
    service.create({ title: 'alice のメモ', body: '' }, alice);
    service.create({ title: 'bob のメモ', body: '' }, bob);
    expect(service.findAll(admin)).toHaveLength(2);
  });

  it('他の人のメモは読めない・書き換えられない・消せない', () => {
    const note = service.create({ title: 'alice のメモ', body: '' }, alice);
    expect(() => service.findOne(note.id, bob)).toThrow(ForbiddenException);
    expect(() => service.update(note.id, { title: 'x' }, bob)).toThrow(
      ForbiddenException,
    );
    expect(() => service.remove(note.id, bob)).toThrow(ForbiddenException);
  });

  it('admin は他の人のメモも消せる', () => {
    const note = service.create({ title: 'alice のメモ', body: '' }, alice);
    service.remove(note.id, admin);
    expect(service.findAll(admin)).toHaveLength(0);
  });

  it('無いメモは 404', () => {
    expect(() => service.findOne('no-such-id', admin)).toThrow(
      NotFoundException,
    );
  });
});
