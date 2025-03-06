import type {
  CognitoJwtPayload,
  CognitoIdTokenPayload,
  CognitoAccessTokenPayload,
} from 'aws-jwt-verify/jwt-model';

import {
  CognitoIdentityProviderClient,
  RevokeTokenCommand,
  AdminGetUserCommand,
  AdminInitiateAuthCommand,
  AdminSetUserPasswordCommand,
  type RevokeTokenCommandOutput,
  type AdminGetUserCommandOutput,
  type AttributeType,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { SimpleFetcher } from 'aws-jwt-verify/https';
import { SimpleJwksCache } from 'aws-jwt-verify/jwk';
import { z } from 'zod';

import env from '@/config/env';
import { logger } from '@/lib/logger';

const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
  region: env.AWS_REGION,
});

interface AuthResult {
  success: boolean;
  tokens?: {
    AccessToken?: string;
    ExpiresIn?: number;
    TokenType?: string;
    RefreshToken?: string;
    IdToken?: string;
  };
  error?: Error;
}

export async function revokeRefreshToken(
  refreshToken: string
): Promise<RevokeTokenCommandOutput> {
  const command = new RevokeTokenCommand({
    Token: refreshToken,
    ClientId: env.COGNITO_CLIENT_ID,
  });
  return cognitoIdentityProviderClient.send(command);
}

export async function generateNewTokensFromRefreshToken(
  refreshToken: string
): Promise<AuthResult> {
  const command = new AdminInitiateAuthCommand({
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: env.COGNITO_CLIENT_ID,
    UserPoolId: env.COGNITO_USER_POOL_ID,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  });

  try {
    const response = await cognitoIdentityProviderClient.send(command);
    return {
      success: true,
      tokens: response.AuthenticationResult,
    };
  } catch (error) {
    logger.error(error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

interface UserExistsResult {
  success: boolean;
  message: string;
  response?: AdminGetUserCommandOutput;
}

export async function checkUserExists(
  email: string
): Promise<UserExistsResult> {
  const params = {
    UserPoolId: env.COGNITO_USER_POOL_ID,
    Username: email,
  };

  try {
    const command = new AdminGetUserCommand(params);
    const response = await cognitoIdentityProviderClient.send(command);
    return {
      success: true,
      message: 'User exists',
      response,
    };
  } catch (err) {
    if (err instanceof Error && err.name === 'UserNotFoundException') {
      return {
        success: false,
        message: 'User does not exist',
      };
    }
    logger.error(err);
    throw err;
  }
}

const verifierCache: Record<
  string,
  ReturnType<typeof CognitoJwtVerifier.create>
> = {};
export async function verifyCognitoToken(token: string, type: 'access' | 'id') {
  const cacheKey = `${type}-${env.COGNITO_USER_POOL_ID}`;
  if (!verifierCache[cacheKey]) {
    verifierCache[cacheKey] = CognitoJwtVerifier.create(
      {
        userPoolId: `${env.COGNITO_USER_POOL_ID}`,
        clientId: `${env.COGNITO_CLIENT_ID}`,
        tokenUse: type,
      },
      {
        jwksCache: new SimpleJwksCache({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          fetcher: new SimpleFetcher({
            defaultRequestOptions: {
              responseTimeout: 1000 * 30,
            },
          }),
        }),
      }
    );
  }
  const verifier = verifierCache[cacheKey];
  try {
    const payload = await verifier.verify(token);
    return payload as
      | CognitoJwtPayload
      | CognitoIdTokenPayload
      | CognitoAccessTokenPayload;
  } catch {
    return null;
  }
}

export async function getCognitoUserBySub({
  sub,
}: {
  sub: string;
}): Promise<AttributeType[] | null> {
  // Correct return type
  try {
    const command = new AdminGetUserCommand({
      UserPoolId: env.COGNITO_USER_POOL_ID,
      Username: sub,
    });
    const response: AdminGetUserCommandOutput =
      await cognitoIdentityProviderClient.send(command);
    return response.UserAttributes || null;
  } catch (error) {
    logger.error('Error fetching user:', error);
    return null;
  }
}

const congintoAttributeParserSchema = z
  .object({
    email: z.string().optional().nullable(),
    given_name: z.string().optional().nullable(),
    family_name: z.string().optional().nullable(),
    phone_number: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    birthdate: z.string().optional().nullable(),
    phone_number_verified: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .optional()
      .nullable(),
    gender: z.string().optional().nullable(),
    profile: z.string().optional().nullable(),
    'custom:type': z.string().optional().nullable(),
    preferred_username: z.string().optional().nullable(),
    email_verified: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .optional()
      .nullable(),
  })
  .transform((val) => {
    return {
      name: val.given_name + ' ' + val.family_name,
      firstName: val.given_name,
      lastName: val.family_name,
      email: val.email,
      phone: val.phone_number,
      phoneVerified: val.phone_number_verified,
      emailVerified: val.email_verified,
      address: val.address,
      birthdate: val.birthdate,
      username: val.preferred_username,
      gender: val.gender,
      profile: val.profile,
      type: val['custom:type'],
    };
  });

export type CognitoUserAttribute = z.infer<
  typeof congintoAttributeParserSchema
>;

export function serializeCognitoUserAttribute(
  attributes: AttributeType[] | undefined | null
): CognitoUserAttribute {
  if (!attributes) return {} as CognitoUserAttribute;
  if (!Array.isArray(attributes)) return {} as CognitoUserAttribute;
  if (attributes.length === 0) return {} as CognitoUserAttribute;
  try {
    const user = congintoAttributeParserSchema.parse(
      Object.fromEntries(attributes.map(({ Name, Value }) => [Name, Value]))
    );
    return user;
  } catch (error) {
    logger.error('Error serializing user attributes:', error);
    return {} as CognitoUserAttribute;
  }
}

export async function getCognitoUserSerialized(
  sub: string
): Promise<CognitoUserAttribute> {
  const attributes = await getCognitoUserBySub({ sub });
  return serializeCognitoUserAttribute(attributes);
}

interface PasswordChangeResult {
  success: boolean;
  message: string;
  errors?: {
    currentPassword?: string[];
    [key: string]: string[] | undefined;
  };
}

export async function changeCognitoUserPassword(
  username: string,
  currentPassword: string,
  newPassword: string,
  permanent = true
): Promise<PasswordChangeResult> {
  try {
    // Verify the old password
    const authCommand = new AdminInitiateAuthCommand({
      UserPoolId: env.COGNITO_USER_POOL_ID,
      ClientId: env.COGNITO_CLIENT_ID,
      AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: currentPassword,
      },
    });

    await cognitoIdentityProviderClient.send(authCommand);

    // Update to the new password
    const passwordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: env.COGNITO_USER_POOL_ID,
      Username: username,
      Password: newPassword,
      Permanent: permanent,
    });

    await cognitoIdentityProviderClient.send(passwordCommand);

    return { success: true, message: 'Password updated successfully.' };
  } catch (error: any) {
    const message =
      error.message ?? 'Failed to change password. Please try again later.';
    if (error.name === 'NotAuthorizedException') {
      return {
        success: false,
        errors: {
          currentPassword: ['Password is incorrect'],
        },
        message: message,
      };
    }
    logger.error('Error changing password:', error);
    return {
      success: false,
      message,
    };
  }
}

// Update Cognito User Attributes
export interface UpdateCognitoUserParams {
  userName: string;
  attributes: { Name: string; Value: string }[];
}

export interface UpdateCognitoUserResult {
  success: boolean;
  message: string;
  user?: CognitoUserAttribute;
  error?: {
    code: string;
    message: string;
  };
}

export async function updateCognitoUser({
  userName,
  attributes,
}: UpdateCognitoUserParams): Promise<UpdateCognitoUserResult> {
  try {
    const updateCommand = new AdminUpdateUserAttributesCommand({
      UserPoolId: env.COGNITO_USER_POOL_ID,
      Username: userName,
      UserAttributes: attributes,
    });
    await cognitoIdentityProviderClient.send(updateCommand);

    // Fetch and return the updated user attributes
    const updatedAttributes = await getCognitoUserBySub({ sub: userName });
    const user = serializeCognitoUserAttribute(updatedAttributes);

    return {
      success: true,
      message: 'User attributes updated successfully',
      user,
    };
  } catch (error: any) {
    if (!error.code) {
      logger.error('Error updating user attributes:', error);
    }
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: {
        code: error.name || 'UnknownError',
        message: error.message || 'Unknown error occurred',
      },
    };
  }
}
