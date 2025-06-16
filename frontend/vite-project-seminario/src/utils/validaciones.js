// src/utils/validaciones.js

export function validarUsuario(usuario) {
  const errores = []

  if (!usuario) errores.push('El usuario es obligatorio.')
  else {
    if (usuario.length < 6 || usuario.length > 20) {
      errores.push('El usuario debe tener entre 6 y 20 caracteres.')
    }
    if (!/^[a-zA-Z0-9]+$/.test(usuario)) {
      errores.push('El usuario solo puede contener caracteres alfanuméricos.')
    }
  }

  return errores
}

export function validarNombre(nombre) {
  const errores = []

  if (!nombre) errores.push('El nombre es obligatorio.')
  else if (nombre.length > 30) {
    errores.push('El nombre no puede tener más de 30 caracteres.')
  }

  return errores
}

export function validarPassword(password) {
  const errores = []

  if (!password) errores.push('La contraseña es obligatoria.')
  else {
    if (password.length < 8) errores.push('La contraseña debe tener al menos 8 caracteres.')
    if (!/[a-z]/.test(password)) errores.push('Debe contener al menos una minúscula.')
    if (!/[A-Z]/.test(password)) errores.push('Debe contener al menos una mayúscula.')
    if (!/[0-9]/.test(password)) errores.push('Debe contener al menos un número.')
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errores.push('Debe contener al menos un caracter especial.')
  }

  return errores
}

export function validarRegistro({ usuario, nombre, password }) {
  const erroresUsuario = validarUsuario(usuario)
  const erroresNombre = validarNombre(nombre)
  const erroresPassword = validarPassword(password)

  const todosLosErrores = [
    ...erroresUsuario,
    ...erroresNombre,
    ...erroresPassword
  ]

  return todosLosErrores.length === 0 ? true : todosLosErrores.join(' ')
}

export function validarEdicionUsuario(nombre, password, repetirPassword) {
  const errores = []

  if (!nombre) {
    errores.push('El nombre es obligatorio.')
  } else if (nombre.length > 30) {
    errores.push('El nombre no puede tener más de 30 caracteres.')
  }

  if (password || repetirPassword) {
    const erroresPassword = validarPassword(password)
    if (erroresPassword.length > 0) {
      errores.push(...erroresPassword)
    } else if (password !== repetirPassword) {
      errores.push('Las contraseñas no coinciden.')
    }
  }

  return errores
}
