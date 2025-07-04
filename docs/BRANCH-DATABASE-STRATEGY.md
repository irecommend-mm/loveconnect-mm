# Branch Database Strategy

## Current Setup
- **Main Branch**: Uses existing Supabase project (`lvhslqwsijnoxajnujzw`)
- **bolt-version Branch**: Will use new separate Supabase project

## Database Separation Benefits

### 1. **Development Safety**
- Changes in bolt-version won't affect main production data
- Safe to test destructive operations
- Independent schema evolution

### 2. **Performance Isolation**
- Heavy testing won't impact main app performance
- Separate resource allocation
- Independent monitoring

### 3. **Data Management**
- Different user bases for testing
- Separate analytics and metrics
- Independent backup strategies

### 4. **Deployment Flexibility**
- Deploy bolt-version independently
- A/B testing capabilities
- Gradual feature rollout

## Implementation Plan

### Phase 1: Setup (Current)
1. Create new Supabase project
2. Update configuration files
3. Set up environment switching

### Phase 2: Migration
1. Run existing migrations on new database
2. Set up RLS policies
3. Configure storage buckets

### Phase 3: Verification
1. Test all features work independently
2. Verify data isolation
3. Test environment switching

### Phase 4: Optimization
1. Set up branch-specific configurations
2. Optimize for development workflow
3. Document switching procedures

## Environment Switching

```bash
# Switch to bolt-version database
git checkout bolt-version
npm run dev  # Uses bolt-version database

# Switch to main database
git checkout main
npm run dev  # Uses main database
```

## Configuration Management

Each branch will have its own:
- Supabase project
- Environment variables
- Database schema
- Storage buckets
- Authentication settings

This ensures complete isolation while maintaining the same codebase structure.