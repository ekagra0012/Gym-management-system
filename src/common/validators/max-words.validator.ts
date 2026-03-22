import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class MaxWordsConstraint implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (typeof text !== 'string') return false;
    const maxWords = args.constraints[0];
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length <= maxWords;
  }

  defaultMessage(args: ValidationArguments) {
    const maxWords = args.constraints[0];
    return `${args.property} must contain no more than ${maxWords} words.`;
  }
}

export function MaxWords(
  maxWords: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [maxWords],
      validator: MaxWordsConstraint,
    });
  };
}
