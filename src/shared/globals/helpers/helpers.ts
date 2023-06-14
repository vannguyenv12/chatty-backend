export class Helpers {
  static firstLetterUppercase(str: string): string {
    const valueString = str.toLowerCase();
    return valueString
      .split(' ')
      .map(
        (value: string) =>
          `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`
      )
      .join(' ');
  }

  static lowerCase(str: string): string {
    return str.toLowerCase();
  }

  static generateRandomIntegers(integersLength: number): number {
    const characters = '0123456789';
    let result = '';
    const characterLength = characters.length;

    for (let i = 0; i < integersLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characterLength));
    }

    return parseInt(result, 10);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static parseJson(prop: string): any {
    try {
      JSON.parse(prop);
    } catch (error) {
      return prop;
    }
  }
}
