export class UserDto {
  id: string;
  email: string;
  createdAt?: Date | undefined;

  constructor(data: {
    id: string;
    email: string;
    createdAt?: Date | undefined;
  }) {
    this.id = data.id;
    this.email = data.email;
    this.createdAt = data.createdAt;
  }

  static fromEntity(entity: {
    _id: { toString(): string };
    email: string;
    createdAt?: Date | undefined;
  }): UserDto {
    return new UserDto({
      id: entity._id.toString(),
      email: entity.email,
      createdAt: entity.createdAt,
    });
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      ...(this.createdAt && { createdAt: this.createdAt }),
    };
  }
}

export class AuthResponseDto {
  status: "success";
  data: {
    accessToken: string;
    user: UserDto;
  };

  constructor(accessToken: string, user: UserDto) {
    this.status = "success";
    this.data = { accessToken, user };
  }

  toJSON() {
    return {
      status: this.status,
      data: {
        accessToken: this.data.accessToken,
        user: this.data.user.toJSON(),
      },
    };
  }
}

export class MeResponseDto {
  status: "success";
  data: {
    user: UserDto;
  };

  constructor(user: UserDto) {
    this.status = "success";
    this.data = { user };
  }

  toJSON() {
    return {
      status: this.status,
      data: {
        user: this.data.user.toJSON(),
      },
    };
  }
}

export class MessageResponseDto {
  status: "success";
  message: string;

  constructor(message: string) {
    this.status = "success";
    this.message = message;
  }

  toJSON() {
    return {
      status: this.status,
      message: this.message,
    };
  }
}

export class ErrorResponseDto {
  status: "error";
  message: string;
  errors?: Record<string, string[]> | undefined;

  constructor(message: string, errors?: Record<string, string[]> | undefined) {
    this.status = "error";
    this.message = message;
    this.errors = errors;
  }

  toJSON() {
    return {
      status: this.status,
      message: this.message,
      ...(this.errors && { errors: this.errors }),
    };
  }
}
