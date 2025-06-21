# NestJS JWT Library

Библиотека для работы с JWT аутентификацией в NestJS приложениях.

## Установка

```bash
pnpm add @libs/nest-jwt
```

## Использование

### 1. Импорт модуля

```typescript
import { TokenModule } from '@libs/nest-jwt';

@Module({
  imports: [TokenModule],
  // ...
})
export class AppModule {}
```

### 2. Защита эндпоинтов

```typescript
import { JwtAuthGuard } from '@libs/nest-jwt';

@UseGuards(JwtAuthGuard)
@Get('protected')
public async protectedEndpoint() {
  return 'This endpoint is protected';
}
```

### 3. Извлечение ID пользователя

```typescript
import { UserId } from '@libs/nest-jwt';

@UseGuards(JwtAuthGuard)
@Get('profile')
public async getProfile(@UserId() userId: string) {
  return this.userService.findById(userId);
}
```

## API

### Декораторы

#### `@UserId()`

Извлекает ID пользователя из JWT токена.

**Требования:**
- Должен использоваться только в методах, защищенных `@UseGuards(JwtAuthGuard)`
- JWT токен должен содержать поле `sub` с ID пользователя

**Пример:**
```typescript
@UseGuards(JwtAuthGuard)
@Post('sessions')
public async createSession(
  @Body() dto: CreateSessionDto,
  @UserId() userId: string,
): Promise<SessionDto> {
  return this.sessionService.create(dto, userId);
}
```

### Guards

#### `JwtAuthGuard`

Проверяет валидность JWT токена из cookies.

**Конфигурация:**
- Извлекает токен из `req.cookies.accessToken`
- Использует секретный ключ из переменной окружения `JWT_SECRET`

### Services

#### `TokenService`

Сервис для работы с JWT токенами.

**Методы:**
- `generateAccessToken(payload)` - генерирует access token
- `generateRefreshToken(payload)` - генерирует refresh token
- `verifyToken(token)` - проверяет валидность токена

## Конфигурация

### Переменные окружения

```env
JWT_SECRET=your-secret-key-here
```

### Настройки токенов

Токены настраиваются в `TokenService`:

```typescript
// Access token - короткий срок жизни
const accessToken = this.tokenService.generateAccessToken(payload);

// Refresh token - длинный срок жизни
const refreshToken = this.tokenService.generateRefreshToken(payload);
```

## Безопасность

- Токены хранятся в httpOnly cookies
- Используется sameSite: 'lax' для защиты от CSRF
- В production используется secure: true для HTTPS
- Секретный ключ должен быть достаточно длинным и случайным

## Примеры

### Полная аутентификация

```typescript
@Controller('auth')
export class AuthController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('login')
  public async login(@Body() dto: LoginDto, @Res() res: Response) {
    // Валидация пользователя...

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    res.cookie('accessToken', accessToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: accessToken.expiresIn * 1000,
    });

    res.cookie('refreshToken', refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: refreshToken.expiresIn * 1000,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  public async getProfile(@UserId() userId: string) {
    return this.userService.findById(userId);
  }
}