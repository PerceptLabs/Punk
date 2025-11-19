/**
 * GlyphCase Basic Usage Example
 * Demonstrates core features of Active Capsule with Lua runtime
 */

import { GlyphCase } from '@punk/glyphcase';

async function main() {
  console.log('🚀 GlyphCase Basic Usage Example\n');

  // ============================================================================
  // 1. Initialize GlyphCase with schema
  // ============================================================================

  console.log('1. Initializing GlyphCase...');

  const db = new GlyphCase({
    dbPath: './example.db',
    schema: {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'INTEGER', primary: true },
            { name: 'email', type: 'TEXT', unique: true },
            { name: 'name', type: 'TEXT', notNull: true },
            { name: 'age', type: 'INTEGER' },
            { name: 'status', type: 'TEXT', default: 'active' }
          ],
          capsule: {
            watch: true,
            retentionDays: 30
          }
        },
        {
          name: 'posts',
          columns: [
            { name: 'id', type: 'INTEGER', primary: true },
            { name: 'user_id', type: 'INTEGER' },
            { name: 'title', type: 'TEXT', notNull: true },
            { name: 'content', type: 'TEXT' },
            { name: 'published', type: 'INTEGER', default: 0 }
          ],
          capsule: {
            watch: true
          }
        }
      ]
    },
    lua: {
      runtime: '5.4'
    }
  });

  console.log('✓ Database initialized\n');

  // ============================================================================
  // 2. Basic CRUD Operations
  // ============================================================================

  console.log('2. Performing CRUD operations...');

  // Insert users
  const aliceId = db.insert('users', {
    email: 'alice@example.com',
    name: 'Alice',
    age: 30
  });

  const bobId = db.insert('users', {
    email: 'bob@example.com',
    name: 'Bob',
    age: 25
  });

  console.log(`✓ Created users: Alice (${aliceId}), Bob (${bobId})`);

  // Query users
  const users = db.query('SELECT * FROM users ORDER BY name');
  console.log(`✓ Queried ${users.length} users:`, users.map(u => u.name));

  // Update user
  db.update('users', aliceId, { age: 31 });
  console.log('✓ Updated Alice\'s age to 31\n');

  // ============================================================================
  // 3. Active Capsule (Reactive Watchers)
  // ============================================================================

  console.log('3. Setting up reactive watchers...');

  // Watch for user changes
  const unwatchUsers = db.watch('users', (events) => {
    console.log(`📢 Users changed! ${events.length} event(s):`);
    for (const event of events) {
      console.log(`   - ${event.operation}: ${event.newData.name}`);
    }
  });

  // Watch for post changes
  const unwatchPosts = db.watch('posts', (events) => {
    console.log(`📢 Posts changed! ${events.length} event(s):`);
    for (const event of events) {
      console.log(`   - ${event.operation}: ${event.newData.title}`);
    }
  });

  // Trigger some changes
  db.insert('users', { email: 'charlie@example.com', name: 'Charlie', age: 28 });
  db.insert('posts', { user_id: aliceId, title: 'Hello World', content: 'First post!' });

  // Wait for events to process
  await new Promise(resolve => setTimeout(resolve, 200));

  console.log('');

  // ============================================================================
  // 4. Lua Integration
  // ============================================================================

  console.log('4. Executing Lua scripts...');

  // Execute Lua code
  await db.executeLua(`
    print("Hello from Lua 5.4!")

    -- Query users from Lua
    local users = glyphcase.query("SELECT * FROM users ORDER BY age")

    print("Users from Lua:")
    for _, user in ipairs(users) do
      print("  - " .. user.name .. " (age " .. user.age .. ")")
    end

    -- Insert a user from Lua
    local id = glyphcase.insert("users", {
      email = "lua@example.com",
      name = "Lua User",
      age = 99
    })

    print("Created user from Lua with ID:", id)
  `);

  console.log('✓ Lua script executed\n');

  // ============================================================================
  // 5. Lua Functions
  // ============================================================================

  console.log('5. Calling Lua functions...');

  // Define Lua functions
  await db.executeLua(`
    -- Calculate user statistics
    function get_user_stats()
      local users = glyphcase.query("SELECT * FROM users")

      local stats = {
        total = #users,
        adults = 0,
        minors = 0,
        average_age = 0
      }

      local total_age = 0
      for _, user in ipairs(users) do
        total_age = total_age + user.age

        if user.age >= 18 then
          stats.adults = stats.adults + 1
        else
          stats.minors = stats.minors + 1
        end
      end

      stats.average_age = total_age / #users

      return stats
    end

    -- Find users by age range
    function find_users_by_age(min_age, max_age)
      return glyphcase.query(
        "SELECT * FROM users WHERE age BETWEEN ? AND ? ORDER BY age",
        min_age,
        max_age
      )
    end
  `);

  // Call Lua functions from TypeScript
  const stats = await db.callLuaFunction('get_user_stats');
  console.log('✓ User statistics:', stats);

  const youngUsers = await db.callLuaFunction('find_users_by_age', 20, 30);
  console.log(`✓ Found ${youngUsers.length} users between 20-30 years old\n`);

  // ============================================================================
  // 6. Transactions
  // ============================================================================

  console.log('6. Running transaction...');

  db.transaction(() => {
    const userId = db.insert('users', {
      email: 'transaction@example.com',
      name: 'Transaction User',
      age: 40
    });

    db.insert('posts', {
      user_id: userId,
      title: 'Transaction Post',
      content: 'This post was created in a transaction'
    });

    console.log('✓ Transaction completed atomically');
  });

  console.log('');

  // ============================================================================
  // 7. Event Bus
  // ============================================================================

  console.log('7. Using Event Bus...');

  const eventBus = db.getEventBus();

  // Subscribe to custom events
  eventBus.on('user:registered', (data) => {
    console.log(`📧 Sending welcome email to ${data.email}`);
  });

  // Emit custom event
  eventBus.emit('user:registered', {
    userId: aliceId,
    email: 'alice@example.com'
  });

  console.log('');

  // ============================================================================
  // 8. Lua Reactive Hooks
  // ============================================================================

  console.log('8. Setting up Lua reactive hooks...');

  await db.executeLua(`
    -- Watch for new users from Lua
    glyphcase.watch("users", function(events)
      for _, event in ipairs(events) do
        if event.operation == "INSERT" then
          print("🎉 New user registered:", event.new_data.name)

          -- Dispatch custom event
          glyphcase.dispatch("user:registered", {
            userId = event.new_data.id,
            email = event.new_data.email
          })
        end
      end
    end)

    print("✓ Lua watcher registered")
  `);

  // Trigger the watcher
  await new Promise(resolve => setTimeout(resolve, 100));
  db.insert('users', { email: 'reactive@example.com', name: 'Reactive User', age: 35 });

  // Wait for event processing
  await new Promise(resolve => setTimeout(resolve, 200));

  console.log('');

  // ============================================================================
  // 9. Advanced Lua Features
  // ============================================================================

  console.log('9. Advanced Lua features...');

  await db.executeLua(`
    -- Schedule recurring task
    scheduler.every("5s", function()
      local count = glyphcase.queryScalar("SELECT COUNT(*) FROM users")
      print("📊 Total users:", count)
    end)

    -- Cache frequently accessed data
    cache.set("app_version", "1.0.0", "1h")
    local version = cache.get("app_version")
    print("App version from cache:", version)

    -- Generate UUID
    local id = crypto.uuid()
    print("Generated UUID:", id)
  `);

  console.log('✓ Advanced features configured\n');

  // ============================================================================
  // 10. Cleanup
  // ============================================================================

  console.log('10. Cleanup...');

  // Unwatch
  unwatchUsers();
  unwatchPosts();

  // Clean up old events (older than 7 days)
  db.cleanup(7);

  console.log('✓ Cleaned up old events');

  // Close database
  db.close();

  console.log('✓ Database closed\n');

  console.log('🎉 Example completed successfully!');
}

// Run example
main().catch(console.error);
