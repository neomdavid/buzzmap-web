# Account Status Validation Solution

## Problem

When a super admin disables an admin account, the disabled admin can continue using the application until their JWT token expires or they manually log out. This creates a security vulnerability where disabled users retain access to admin functions.

## Solution Overview

This solution implements real-time account status validation that automatically logs out disabled users through multiple layers:

1. **Periodic Session Validation** - Checks account status every 30 seconds
2. **API Response Interception** - Detects account disabled errors from backend
3. **Automatic Logout** - Immediately logs out disabled users
4. **Event-Driven Architecture** - Uses custom events for cross-component communication

## Implementation Details

### 1. Session Validation Hook (`src/hooks/useSessionValidation.js`)

- Periodically queries the backend to check current user's account status
- Automatically logs out users whose accounts are disabled
- Only runs for admin/superadmin users to avoid unnecessary API calls
- Configurable validation interval (default: 30 seconds)

### 2. Enhanced API Base Query (`src/api/dengueApi.js`)

- Intercepts 401/403 responses that indicate account disabled
- Dispatches custom events when account disabled errors are detected
- Handles both direct account disabled responses and generic auth errors

### 3. AuthGuard Component (`src/components/AuthGuard.jsx`)

- Wraps admin/superadmin routes with enhanced session validation
- Listens for account disabled events and handles logout
- Provides additional security layer for protected routes

### 4. Account Status Handler (`src/utils/accountStatusHandler.js`)

- Centralized utility functions for handling account status changes
- Custom event system for cross-component communication
- Consistent error handling and user feedback

### 5. Updated Route Protection (`src/App.jsx`)

- Enhanced PrivateRoute component uses AuthGuard for admin/superadmin routes
- Maintains existing token validation while adding account status checks

## Backend Requirements

For this solution to work effectively, your backend should:

### 1. Return Appropriate HTTP Status Codes

When an account is disabled, API endpoints should return:

- `401 Unauthorized` with message containing "disabled", "account disabled", or "inactive"
- `403 Forbidden` with similar message for account status issues

### 2. Include Account Status in Error Messages

```json
{
  "error": {
    "status": 401,
    "message": "Account has been disabled"
  }
}
```

### 3. Validate Account Status in Middleware

Add middleware that checks account status before processing requests:

```javascript
// Example backend middleware
const checkAccountStatus = (req, res, next) => {
  const user = req.user; // From JWT verification

  if (user.status === "disabled") {
    return res.status(401).json({
      error: {
        message: "Account has been disabled",
        code: "ACCOUNT_DISABLED",
      },
    });
  }

  next();
};
```

### 4. Update JWT Token Validation

Consider including account status in JWT tokens or validating it on each request.

## Usage

### For Admin/Superadmin Components

The validation is automatically applied to all admin/superadmin routes through the updated PrivateRoute component. No additional changes needed.

### For Custom Components

If you need to manually check account status:

```javascript
import { useSessionValidation } from "../hooks/useSessionValidation";

function MyAdminComponent() {
  const { validateAccountStatus } = useSessionValidation();

  const handleSensitiveAction = async () => {
    // Manually validate before sensitive operations
    const isValid = validateAccountStatus();
    if (!isValid) return;

    // Proceed with action
  };
}
```

### For Global Error Handling

Set up global account status handling in your app initialization:

```javascript
import { setupGlobalAccountStatusHandler } from "./utils/accountStatusHandler";

// In your main App component
useEffect(() => {
  const cleanup = setupGlobalAccountStatusHandler(store, navigate);
  return cleanup;
}, []);
```

## Configuration

### Validation Interval

Adjust the validation frequency by modifying the interval parameter:

```javascript
// Check every 15 seconds instead of 30
useSessionValidation(15000);
```

### Error Message Customization

Customize error messages in `src/utils/accountStatusHandler.js`:

```javascript
export const handleAccountDisabledError = (
  dispatch,
  navigate,
  errorMessage
) => {
  // Customize the error message here
  const customMessage = "Your access has been revoked. Please contact support.";
  // ... rest of the function
};
```

## Security Considerations

1. **Token Expiration**: The solution works alongside JWT token expiration
2. **Network Resilience**: Handles network errors gracefully
3. **Performance**: Minimal impact with configurable validation intervals
4. **User Experience**: Clear error messages and smooth logout process

## Testing

### Manual Testing

1. Login as an admin user
2. In another session, disable the admin account as super admin
3. Within 30 seconds, the disabled admin should be automatically logged out
4. Any API calls should also trigger immediate logout

### Automated Testing

Consider adding tests for:

- Account status validation hook
- API error handling
- AuthGuard component behavior
- Event system functionality

## Troubleshooting

### Common Issues

1. **Validation not working**: Check if the backend returns proper error codes
2. **Multiple logouts**: Ensure event listeners are properly cleaned up
3. **Performance issues**: Increase validation interval or optimize API calls

### Debug Mode

Enable debug logging by checking browser console for messages prefixed with:

- `[SESSION_VALIDATION]`
- `[AuthGuard]`
- `[AccountStatusHandler]`

## Future Enhancements

1. **WebSocket Integration**: Real-time account status updates
2. **Offline Support**: Cache account status for offline scenarios
3. **Advanced Notifications**: Toast notifications for account status changes
4. **Audit Logging**: Track account status changes and logouts
