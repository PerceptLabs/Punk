/**
 * GlyphCase Integration Tests
 * Tests for Active Capsule, Lua Runtime, and Skill System
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { GlyphCase } from '../index';

describe('GlyphCase Integration Tests', () => {
  let db: GlyphCase;
  const testDbPath = './test.db';

  beforeEach(() => {
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Initialize GlyphCase
    db = new GlyphCase({
      dbPath: testDbPath,
      schema: {
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER', primary: true },
              { name: 'email', type: 'TEXT', unique: true },
              { name: 'name', type: 'TEXT', notNull: true },
              { name: 'age', type: 'INTEGER' }
            ],
            capsule: { watch: true }
          },
          {
            name: 'posts',
            columns: [
              { name: 'id', type: 'INTEGER', primary: true },
              { name: 'user_id', type: 'INTEGER' },
              { name: 'title', type: 'TEXT', notNull: true },
              { name: 'content', type: 'TEXT' }
            ],
            capsule: { watch: true }
          }
        ]
      },
      lua: {
        runtime: '5.4'
      }
    });
  });

  afterEach(() => {
    db.close();

    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('Database Operations', () => {
    it('should insert data', () => {
      const userId = db.insert('users', {
        email: 'alice@example.com',
        name: 'Alice',
        age: 30
      });

      expect(userId).toBeGreaterThan(0);
    });

    it('should query data', () => {
      db.insert('users', { email: 'alice@example.com', name: 'Alice', age: 30 });
      db.insert('users', { email: 'bob@example.com', name: 'Bob', age: 25 });

      const users = db.query('SELECT * FROM users ORDER BY name');

      expect(users).toHaveLength(2);
      expect(users[0].name).toBe('Alice');
      expect(users[1].name).toBe('Bob');
    });

    it('should update data', () => {
      const userId = db.insert('users', { email: 'alice@example.com', name: 'Alice', age: 30 });

      db.update('users', userId, { age: 31 });

      const user = db.query('SELECT * FROM users WHERE id = ?', [userId])[0];
      expect(user.age).toBe(31);
    });

    it('should delete data', () => {
      const userId = db.insert('users', { email: 'alice@example.com', name: 'Alice', age: 30 });

      db.delete('users', userId);

      const users = db.query('SELECT * FROM users');
      expect(users).toHaveLength(0);
    });

    it('should support transactions', () => {
      db.transaction(() => {
        db.insert('users', { email: 'alice@example.com', name: 'Alice', age: 30 });
        db.insert('users', { email: 'bob@example.com', name: 'Bob', age: 25 });
      });

      const users = db.query('SELECT * FROM users');
      expect(users).toHaveLength(2);
    });
  });

  describe('Active Capsule (Reactive)', () => {
    it('should watch table changes', (done) => {
      let eventCount = 0;

      const unwatch = db.watch('users', (events) => {
        eventCount += events.length;

        if (eventCount >= 2) {
          expect(eventCount).toBe(2);
          unwatch();
          done();
        }
      });

      db.insert('users', { email: 'alice@example.com', name: 'Alice', age: 30 });
      db.insert('users', { email: 'bob@example.com', name: 'Bob', age: 25 });
    });

    it('should detect INSERT operations', (done) => {
      const unwatch = db.watch('users', (events) => {
        expect(events[0].operation).toBe('INSERT');
        expect(events[0].newData.email).toBe('alice@example.com');
        unwatch();
        done();
      });

      db.insert('users', { email: 'alice@example.com', name: 'Alice', age: 30 });
    });
  });

  describe('Lua Runtime', () => {
    it('should execute Lua scripts', async () => {
      await db.executeLua(`
        local result = 2 + 2
        _G.test_result = result
      `);

      const result = await db.getLuaRuntime()?.getGlobal('test_result');
      expect(result).toBe(4);
    });

    it('should expose glyphcase API to Lua', async () => {
      await db.executeLua(`
        -- Insert user from Lua
        local id = glyphcase.insert("users", {
          email = "lua@example.com",
          name = "Lua User",
          age = 99
        })

        _G.inserted_id = id
      `);

      const insertedId = await db.getLuaRuntime()?.getGlobal('inserted_id');
      expect(insertedId).toBeGreaterThan(0);

      const users = db.query('SELECT * FROM users WHERE email = ?', ['lua@example.com']);
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('Lua User');
      expect(users[0].age).toBe(99);
    });

    it('should query from Lua', async () => {
      db.insert('users', { email: 'alice@example.com', name: 'Alice', age: 30 });
      db.insert('users', { email: 'bob@example.com', name: 'Bob', age: 25 });

      await db.executeLua(`
        -- Query users from Lua
        local users = glyphcase.query("SELECT * FROM users ORDER BY name")

        _G.user_count = #users
        _G.first_user = users[1].name
      `);

      const userCount = await db.getLuaRuntime()?.getGlobal('user_count');
      const firstName = await db.getLuaRuntime()?.getGlobal('first_user');

      expect(userCount).toBe(2);
      expect(firstName).toBe('Alice');
    });

    it('should call Lua functions', async () => {
      await db.executeLua(`
        function add(a, b)
          return a + b
        end

        function get_user_info(name, age)
          return {
            name = name,
            age = age,
            is_adult = age >= 18
          }
        end
      `);

      const sum = await db.callLuaFunction('add', 5, 3);
      expect(sum).toBe(8);

      const userInfo = await db.callLuaFunction('get_user_info', 'Alice', 30);
      expect(userInfo.name).toBe('Alice');
      expect(userInfo.age).toBe(30);
      expect(userInfo.is_adult).toBe(true);
    });

    it('should support Lua transactions', async () => {
      await db.executeLua(`
        glyphcase.transaction(function()
          glyphcase.insert("users", {
            email = "tx1@example.com",
            name = "Transaction User 1",
            age = 20
          })

          glyphcase.insert("users", {
            email = "tx2@example.com",
            name = "Transaction User 2",
            age = 21
          })
        end)
      `);

      const users = db.query('SELECT * FROM users ORDER BY email');
      expect(users).toHaveLength(2);
      expect(users[0].email).toBe('tx1@example.com');
      expect(users[1].email).toBe('tx2@example.com');
    });

    it('should sandbox dangerous operations', async () => {
      // Should throw error when trying to use io
      await expect(async () => {
        await db.executeLua(`
          io.open("/etc/passwd", "r")
        `);
      }).rejects.toThrow();

      // Should throw error when trying to use os.execute
      await expect(async () => {
        await db.executeLua(`
          os.execute("rm -rf /")
        `);
      }).rejects.toThrow();
    });
  });

  describe('Event Bus', () => {
    it('should emit and listen to custom events', (done) => {
      const eventBus = db.getEventBus();

      eventBus.on('custom:event', (data) => {
        expect(data.message).toBe('Hello from event');
        done();
      });

      eventBus.emit('custom:event', { message: 'Hello from event' });
    });

    it('should support once listeners', () => {
      const eventBus = db.getEventBus();
      let callCount = 0;

      eventBus.once('once:event', () => {
        callCount++;
      });

      eventBus.emit('once:event', {});
      eventBus.emit('once:event', {});
      eventBus.emit('once:event', {});

      expect(callCount).toBe(1);
    });

    it('should unsubscribe', () => {
      const eventBus = db.getEventBus();
      let callCount = 0;

      const unsubscribe = eventBus.on('test:event', () => {
        callCount++;
      });

      eventBus.emit('test:event', {});
      unsubscribe();
      eventBus.emit('test:event', {});

      expect(callCount).toBe(1);
    });
  });

  describe('Lua + Active Capsule Integration', () => {
    it('should watch from Lua', async (done) => {
      await db.executeLua(`
        _G.change_count = 0

        glyphcase.watch("users", function(events)
          _G.change_count = _G.change_count + #events
        end)
      `);

      // Give Lua time to set up watcher
      setTimeout(async () => {
        db.insert('users', { email: 'watch1@example.com', name: 'Watch 1', age: 20 });
        db.insert('users', { email: 'watch2@example.com', name: 'Watch 2', age: 21 });

        // Give Lua time to process events
        setTimeout(async () => {
          const changeCount = await db.getLuaRuntime()?.getGlobal('change_count');
          expect(changeCount).toBeGreaterThan(0);
          done();
        }, 200);
      }, 100);
    });
  });
});
