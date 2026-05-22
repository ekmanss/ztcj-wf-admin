import { Transform, type TransformFnParams } from 'class-transformer'
import { IsString, MinLength } from 'class-validator'

export class LoginDto {
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsString()
  @MinLength(1)
  account!: string

  @IsString()
  @MinLength(1)
  password!: string
}
