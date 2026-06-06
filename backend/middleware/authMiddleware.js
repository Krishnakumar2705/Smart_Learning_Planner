import { createClerkClient } from '@clerk/backend';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Verify Clerk session token on every protected request
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, token is missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token with Clerk
    const payload = await clerk.verifyToken(token);

    // Attach the Clerk user ID to req.user so controllers can use it
    req.user = { _id: payload.sub };
    next();
  } catch (error) {
    console.error('Clerk token verification failed:', error.message);
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};
