-- Example Skill Initialization Script

print("Initializing Example Skill...")

-- Global state
_G.skill_state = {
  activated = false,
  event_count = 0
}

-- Lifecycle Hooks

function on_install()
  print("Installing Example Skill...")

  -- Create default data
  glyphcase.insert("settings", {
    key = "example_skill_installed",
    value = "true"
  })

  print("Example Skill installed successfully")
end

function on_activate()
  print("Activating Example Skill...")

  _G.skill_state.activated = true

  -- Watch for user changes
  glyphcase.watch("users", function(events)
    _G.skill_state.event_count = _G.skill_state.event_count + #events

    for _, event in ipairs(events) do
      if event.operation == "INSERT" then
        print("New user created: " .. event.new_data.name)

        -- Dispatch custom event
        glyphcase.dispatch("user:created", {
          userId = event.new_data.id,
          email = event.new_data.email
        })
      end
    end
  end)

  print("Example Skill activated")
end

function on_deactivate()
  print("Deactivating Example Skill...")

  _G.skill_state.activated = false

  print("Example Skill deactivated")
end

-- Data transformation hooks

function before_save(table_name, data)
  if table_name == "users" then
    -- Auto-generate display name if not provided
    if not data.display_name and data.name then
      data.display_name = data.name
    end
  end

  return data
end

-- Custom skill functions

function process_users()
  local users = glyphcase.query("SELECT * FROM users")

  local result = {
    total = #users,
    adults = 0,
    minors = 0
  }

  for _, user in ipairs(users) do
    if user.age >= 18 then
      result.adults = result.adults + 1
    else
      result.minors = result.minors + 1
    end
  end

  return result
end

print("Example Skill initialized")
