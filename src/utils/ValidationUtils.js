export class ValidationUtils {
  // validationTel = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  static fullName(value) {
    const validationFullName = /^([a-zA-ZÀ-ÿ]+(?: [a-zA-ZÀ-ÿ]+){1,})$/;
    return validationFullName.test(value) && value.length <= 100 ? true : 'Nome inválido.';
  }

  static firstName(value) {
    return value && value.length >= 2
      ? true
      : 'O primeiro nome precisa ter pelo menos 2 letras.';
  }
  
  static lastName(value) {
    return value && value.length >= 2
      ? true
      : 'O sobrenome precisa ter pelo menos 2 letras.';
  }

  static cpf(value) {
    const validationCpf = /^\d{11}$/;
    return validationCpf.test(value) ? true : 'CPF inválido.';
  }

  static email(value) {
    const validationEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return validationEmail.test(value) ? true : 'Email inválido.';
  }

  static phoneNumber(value) {
    const validationPhoneNumber = /^\d{10,15}$/;
    return validationPhoneNumber.test(value) ? true : 'Número de celeluar inválido.';
  }
  
  static password(value) {
    const validationPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    //Minimum eight characters, at least one letter and one number:
    return validationPassword.test(value)
      ? true
      : 'A senha precisa ter no mínimo 8 caracteres, pelo menos uma letra e um número.';
  }

  static title(value) {
    return value && value.length >= 5 && value.length <= 150
      ? true
      : 'O título precisa ter no mínimo 5 caracteres e no máximo 150 caracteres.';
  }

  static subtitle(value) {
    return value && value.length >= 5 && value.length <= 150
      ? true
      : 'O subtítulo precisa ter no mínimo 5 caracteres e no máximo 150 caracteres.';
  }

  static titleDescription(value) {
    return value && value.length >= 5 && value.length <= 150
      ? true
      : 'A título da Introdução precisa ter no mínimo 5 caracteres e no máximo 150 caracteres.';
  }

  static description(value) {
    return value && value.length >= 5 && value.length <= 1000
      ? true
      : 'A Introdução precisa ter no mínimo 5 caracteres e no máximo 1000 caracteres.';
  }
 
  static string(value) {
    return value && value.length >= 3 && value.length <= 70
      ? true
      : 'O nome do seu negócio precisa ter no mínimo 3 letras e no máximo 70 letras.';
  }

  static hexColor(value) {
    const validationHexColor = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
    return validationHexColor.test(value)
      ? true
      : 'A cor inválida.';
  }

  static hours(value) {  
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(value)) return 'Formato inválido';

    const [hours, minutes] = value.split(':').map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return 'Valores inválidos';
    }
  
    return true;
  }
}
