# 🏋️‍♂️ Backend Audit Findings & Refactoring Notes

This document details all bugs, architectural flaws, code quality warnings, and recommendations discovered during the audit of the backend module (`gymapp-back`).

---

## 🚨 Critical Bugs & Errors

### 1. Broken Soft-Delete Annotations (`@SQLDelete`)
* **Location:** 
  * `com.aplicacionGym.gymapp.modules.core.entity.Person`
  * `com.aplicacionGym.gymapp.modules.payments.entity.Payment`
  * `com.aplicacionGym.gymapp.modules.payments.entity.Product`
  * `com.aplicacionGym.gymapp.modules.routines.entity.Routine`
* **Issue:** 
  In the `V4__Modular_Table_Prefixes.sql` migration, the tables were renamed to include modular prefixes:
  * `person` ➡️ `core_person`
  * `payment` ➡️ `pay_payment`
  * `product` ➡️ `pay_product`
  * `routine` ➡️ `rout_routine`
  
  However, the `@SQLDelete` annotations on the corresponding Java entity classes were not updated and still target the old table names:
  * `@SQLDelete(sql = "UPDATE person SET deleted = true WHERE id = ?")`
  * `@SQLDelete(sql = "UPDATE payment SET deleted = true WHERE id = ?")`
  * `@SQLDelete(sql = "UPDATE product SET deleted = true WHERE id = ?")`
  * `@SQLDelete(sql = "UPDATE routine SET deleted = true WHERE id = ?")`
* **Impact:** 
  Any delete operation executed through Spring Data repositories (e.g., `routineRepository.delete(routine)` or `productRepository.deleteById(id)`) will fail and throw a database exception (SQL Table/View not found).
* **Fix:**
  Update the SQL statement inside the `@SQLDelete` annotation on each entity to use the correct table prefix:
  * `Person.java`: `@SQLDelete(sql = "UPDATE core_person SET deleted = true WHERE id = ?")`
  * `Payment.java`: `@SQLDelete(sql = "UPDATE pay_payment SET deleted = true WHERE id = ?")`
  * `Product.java`: `@SQLDelete(sql = "UPDATE pay_product SET deleted = true WHERE id = ?")`
  * `Routine.java`: `@SQLDelete(sql = "UPDATE rout_routine SET deleted = true WHERE id = ?")`

---

## 🏗️ Architectural Issues

### 2. In-Memory JWT Secret Key
* **Location:** `com.aplicacionGym.gymapp.modules.core.security.JwtUtil`
* **Issue:** 
  The signing key used for JWT verification is generated dynamically in-memory at application startup:
  ```java
  private static final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
  ```
* **Impact:** 
  Every time the Spring Boot server restarts (during hot-reloads, deployments, or container restarts), a new random secret key is generated. This immediately invalidates all active tokens issued to users, logging out everyone and forcing them to re-authenticate.
* **Fix:** 
  Generate a static base64-encoded signing key, place it in `application.properties` (or as an environment variable), and load it securely using:
  ```java
  // In application.properties:
  // jwt.secret=YOUR_BASE64_SECURE_SECRET_KEY
  
  // In JwtUtil.java:
  // Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret))
  ```

---

## 🔀 MapStruct Mapping Issues

### 3. Missing Price Mapping in `ClientMapper`
* **Location:** `com.aplicacionGym.gymapp.modules.clients.mapper.ClientMapper`
* **Issue:** 
  The mapping method:
  ```java
  ProductsPurchasedResponseDTO toProductsPurchasedResponseDTO(PaymentProduct paymentProduct);
  ```
  leaves the `price` field in `ProductsPurchasedResponseDTO` unmapped because the source field on `PaymentProduct` is named `unitPrice`. MapStruct throws a warning and leaves the field as `null` in the resulting DTO.
* **Impact:** 
  The client's purchased products API endpoint returns `null` prices, breaking the sales history visibility in the frontend.
* **Fix:** 
  Add the explicit mapping annotation:
  ```java
  @Mapping(source = "unitPrice", target = "price")
  ProductsPurchasedResponseDTO toProductsPurchasedResponseDTO(PaymentProduct paymentProduct);
  ```

### 4. Unmapped Properties Compilation Warnings
* **Location:** Multiple Mapper interfaces (`AuthMapper`, `RoutineMapper`, `ClientMapper`, `AdministratorMapper`)
* **Issue:** 
  MapStruct raises compile-time warnings about unmapped target properties during conversion:
  * `AuthMapper.java`: `role, token, refreshToken`
  * `RoutineMapper.java`: `id, deleted, clients, version, parentId`
  * `ClientMapper.java`: `deleted`
  * `AdministratorMapper.java`: `id, deleted`
* **Fix:** 
  Explicitly ignore these target fields in the mapping annotations to suppress warnings and ensure clean builds:
  * Example for `AuthMapper`:
    ```java
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "token", ignore = true)
    @Mapping(target = "refreshToken", ignore = true)
    ```

---

## 🔒 Security Recommendations

### 5. Overly Permissive CORS with Credentials
* **Location:** `com.aplicacionGym.gymapp.modules.core.config.SecurityConfig`
* **Issue:** 
  CORS is configured to allow all origin patterns (`*`) while enabling credentials:
  ```java
  configuration.setAllowedOriginPatterns(java.util.List.of("*"));
  configuration.setAllowCredentials(true);
  ```
* **Impact:** 
  Enabling `allowCredentials` with a wildcard allows any external malicious site to make authenticated AJAX requests on behalf of logged-in users (potential CSRF risks).
* **Fix:** 
  Restrict the allowed origin patterns to the actual frontend hostnames/ports used in development and production (e.g. `http://localhost`, `http://localhost:80`).

---

## 📝 Discrepancies

### 6. Java Version Mismatch
* **Issue:** 
  The `README.md` states the backend runs on **Java 21** (`Java 21` badge and requirements), but `pom.xml` configures target compilation for **Java 17**:
  ```xml
  <properties>
      <java.version>17</java.version>
  </properties>
  ```
* **Fix:** 
  Align both to Java 21 if Java 21 features are needed, or update the README to state Java 17.
