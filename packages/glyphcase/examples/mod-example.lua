--[[
  Example GlyphCase Mod
  Demonstrates all Lua features and reactive capabilities
]]--

-- ============================================================================
-- Lifecycle Hooks
-- ============================================================================

function on_install()
  print("Installing Example Mod...")

  -- Create initial data
  glyphcase.transaction(function()
    glyphcase.execute([[
      CREATE TABLE IF NOT EXISTS mod_settings (
        id INTEGER PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      )
    ]])

    glyphcase.insert("mod_settings", {
      key = "version",
      value = "1.0.0"
    })

    glyphcase.insert("mod_settings", {
      key = "installed_at",
      value = tostring(os.time())
    })
  end)

  print("Mod installed successfully")
end

function on_activate()
  print("Activating Example Mod...")

  -- Set up watchers
  setup_watchers()

  -- Schedule background tasks
  setup_scheduler()

  -- Register event handlers
  setup_event_handlers()

  print("Mod activated")
end

function on_deactivate()
  print("Deactivating Example Mod...")

  -- Stop all scheduled tasks
  scheduler.stop_all()

  -- Clear cache
  cache.clear()

  print("Mod deactivated")
end

-- ============================================================================
-- Data Change Handlers
-- ============================================================================

function on_data_changed(table_name, operation, row)
  if table_name == "users" then
    handle_user_change(operation, row)
  elseif table_name == "posts" then
    handle_post_change(operation, row)
  end
end

function handle_user_change(operation, user)
  if operation == "INSERT" then
    print("📧 New user registered:", user.name)

    -- Send welcome email
    glyphcase.dispatch("email:send", {
      to = user.email,
      template = "welcome",
      data = {
        name = user.name
      }
    })

    -- Update statistics
    update_user_stats()

  elseif operation == "UPDATE" then
    -- Check if status changed
    if user.status == "premium" then
      print("⭐ User upgraded to premium:", user.name)

      glyphcase.dispatch("user:upgraded", {
        userId = user.id,
        email = user.email
      })
    end

  elseif operation == "DELETE" then
    print("👋 User deleted:", user.name)

    -- Clean up user's posts
    glyphcase.deleteWhere("posts", "user_id = ?", { user.id })
  end
end

function handle_post_change(operation, post)
  if operation == "INSERT" and post.published == 1 then
    print("📝 New post published:", post.title)

    -- Get author
    local author = glyphcase.queryOne(
      "SELECT * FROM users WHERE id = ?",
      post.user_id
    )

    if author then
      -- Update author's post count
      local post_count = glyphcase.queryScalar(
        "SELECT COUNT(*) FROM posts WHERE user_id = ?",
        author.id
      )

      cache.set("user:" .. author.id .. ":post_count", post_count, "1h")

      -- Notify followers
      glyphcase.dispatch("post:published", {
        postId = post.id,
        authorName = author.name,
        title = post.title
      })
    end
  end
end

-- ============================================================================
-- Watchers
-- ============================================================================

function setup_watchers()
  -- Watch for new users
  glyphcase.watch("users", function(events)
    for _, event in ipairs(events) do
      if event.operation == "INSERT" then
        local user = event.new_data

        -- Auto-tag new users
        local tag = "newcomer"
        if user.age >= 18 then
          tag = "adult"
        else
          tag = "minor"
        end

        cache.set("user:" .. user.id .. ":tag", tag, "24h")
      end
    end
  end)

  -- Watch for published posts
  glyphcase.watch("posts", "WHERE published = 1", function(events)
    local published_count = #events
    print(string.format("📊 %d post(s) published", published_count))

    -- Update trending cache
    invalidate_trending_cache()
  end)
end

-- ============================================================================
-- Scheduler Tasks
-- ============================================================================

function setup_scheduler()
  -- Update statistics every hour
  scheduler.every("1h", function()
    print("📊 Running hourly statistics update...")
    update_user_stats()
    update_post_stats()
  end)

  -- Clean up inactive users daily
  scheduler.every("1d", function()
    print("🧹 Cleaning up inactive users...")

    local inactive_threshold = os.time() - (30 * 24 * 60 * 60) -- 30 days

    glyphcase.execute(string.format([[
      UPDATE users
      SET status = 'inactive'
      WHERE last_login_at < %d
      AND status = 'active'
    ]], inactive_threshold))
  end)

  -- Cache warmup after 5 minutes
  scheduler.after("5m", function()
    print("🔥 Warming up cache...")
    warmup_cache()
  end)
end

-- ============================================================================
-- Event Handlers
-- ============================================================================

function setup_event_handlers()
  -- Handle user registration
  actionbus.register("user:registered", function(data)
    print("Handling user registration:", data.email)

    -- Create welcome post
    glyphcase.insert("posts", {
      user_id = data.userId,
      title = "Welcome to the platform!",
      content = "This is your first post. Get started by...",
      published = 1
    })

    return { success = true }
  end)

  -- Handle post like
  actionbus.register("post:liked", function(data)
    local post = glyphcase.queryOne(
      "SELECT * FROM posts WHERE id = ?",
      data.postId
    )

    if post then
      -- Update like count cache
      local current_likes = cache.get("post:" .. post.id .. ":likes") or 0
      cache.set("post:" .. post.id .. ":likes", current_likes + 1, "1h")

      -- Check if post is trending (>100 likes)
      if current_likes + 1 > 100 then
        glyphcase.dispatch("post:trending", {
          postId = post.id,
          title = post.title,
          likes = current_likes + 1
        })
      end
    end

    return { likes = current_likes + 1 }
  end)
end

-- ============================================================================
-- Data Transformation Hooks
-- ============================================================================

function before_save(table_name, data)
  if table_name == "users" then
    -- Auto-generate display name
    if not data.display_name and data.name then
      data.display_name = data.name
    end

    -- Validate email
    if data.email and not string.match(data.email, "^[^@]+@[^@]+$") then
      error("Invalid email format")
    end

    -- Auto-generate UUID if needed
    if not data.uuid then
      data.uuid = crypto.uuid()
    end
  elseif table_name == "posts" then
    -- Auto-generate slug from title
    if data.title and not data.slug then
      data.slug = generate_slug(data.title)
    end

    -- Set published timestamp
    if data.published == 1 and not data.published_at then
      data.published_at = os.time()
    end
  end

  return data
end

function after_save(table_name, data)
  if table_name == "posts" and data.published == 1 then
    -- Invalidate cache
    cache.delete("posts:latest")
    cache.delete("posts:trending")

    -- Update search index
    update_search_index(data)
  end
end

-- ============================================================================
-- Utility Functions
-- ============================================================================

function update_user_stats()
  local stats = {
    total = 0,
    active = 0,
    inactive = 0,
    premium = 0
  }

  local users = glyphcase.query("SELECT * FROM users")

  stats.total = #users

  for _, user in ipairs(users) do
    if user.status == "active" then
      stats.active = stats.active + 1
    elseif user.status == "inactive" then
      stats.inactive = stats.inactive + 1
    end

    if user.status == "premium" then
      stats.premium = stats.premium + 1
    end
  end

  -- Cache stats
  cache.set("stats:users", stats, "1h")

  print("User stats updated:", stats.total, "total,", stats.active, "active")

  return stats
end

function update_post_stats()
  local stats = glyphcase.queryOne([[
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN published = 1 THEN 1 ELSE 0 END) as published,
      SUM(CASE WHEN published = 0 THEN 1 ELSE 0 END) as drafts
    FROM posts
  ]])

  cache.set("stats:posts", stats, "1h")

  print("Post stats updated:", stats.total, "total,", stats.published, "published")

  return stats
end

function warmup_cache()
  -- Pre-load frequently accessed data
  local latest_posts = glyphcase.query(
    "SELECT * FROM posts WHERE published = 1 ORDER BY published_at DESC LIMIT 10"
  )
  cache.set("posts:latest", latest_posts, "30m")

  local trending_posts = glyphcase.query(
    "SELECT * FROM posts WHERE published = 1 ORDER BY like_count DESC LIMIT 10"
  )
  cache.set("posts:trending", trending_posts, "30m")

  print("Cache warmed up with", #latest_posts, "latest and", #trending_posts, "trending posts")
end

function invalidate_trending_cache()
  cache.delete("posts:trending")
  cache.delete("posts:latest")
end

function generate_slug(title)
  -- Convert to lowercase and replace spaces with hyphens
  local slug = string.lower(title)
  slug = string.gsub(slug, "%s+", "-")
  slug = string.gsub(slug, "[^a-z0-9%-]", "")

  return slug
end

function update_search_index(post)
  -- In a real implementation, this would update a search index
  print("Updating search index for post:", post.title)
end

-- ============================================================================
-- Public API Functions (callable from TypeScript)
-- ============================================================================

function get_dashboard_data()
  local user_stats = cache.get("stats:users")
  if not user_stats then
    user_stats = update_user_stats()
  end

  local post_stats = cache.get("stats:posts")
  if not post_stats then
    post_stats = update_post_stats()
  end

  local latest_posts = cache.get("posts:latest")
  if not latest_posts then
    latest_posts = glyphcase.query(
      "SELECT * FROM posts WHERE published = 1 ORDER BY published_at DESC LIMIT 5"
    )
  end

  return {
    users = user_stats,
    posts = post_stats,
    latest_posts = latest_posts
  }
end

function search_users(query)
  return glyphcase.query(
    "SELECT * FROM users WHERE name LIKE ? OR email LIKE ?",
    "%" .. query .. "%",
    "%" .. query .. "%"
  )
end

function get_user_activity(user_id)
  local user = glyphcase.queryOne("SELECT * FROM users WHERE id = ?", user_id)

  if not user then
    return nil
  end

  local posts = glyphcase.query(
    "SELECT * FROM posts WHERE user_id = ? ORDER BY published_at DESC",
    user_id
  )

  return {
    user = user,
    posts = posts,
    post_count = #posts
  }
end

-- ============================================================================
-- Initialization
-- ============================================================================

print("Example Mod loaded successfully")

-- Export public API
return {
  get_dashboard_data = get_dashboard_data,
  search_users = search_users,
  get_user_activity = get_user_activity
}
