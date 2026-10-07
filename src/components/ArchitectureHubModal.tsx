import React, { useState } from 'react';
import {
  X,
  Code2,
  Database,
  Layers,
  FileCode,
  HelpCircle,
  Terminal,
  Copy,
  Check,
  Download,
  BookOpen,
  Server,
  Globe
} from 'lucide-react';

interface ArchitectureHubModalProps {
  onClose: () => void;
}

export const ArchitectureHubModal: React.FC<ArchitectureHubModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'java_code' | 'mysql' | 'api' | 'tech_roles' | 'viva'>('architecture');
  const [selectedFile, setSelectedFile] = useState<string>('ItemController.java');
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const JAVA_FILES: Record<string, string> = {
    'ItemController.java': `@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    // GET /api/items?search=&type=&category=&status=
    @GetMapping
    public ResponseEntity<List<Item>> getAllItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {

        List<Item> results = itemRepository.searchItems(
            type != null ? Item.ItemType.valueOf(type.toUpperCase()) : null,
            category,
            status != null ? Item.ItemStatus.valueOf(status.toUpperCase()) : null,
            search
        );
        return ResponseEntity.ok(results);
    }

    // POST /api/items (Report Lost or Found Item)
    @PostMapping
    public ResponseEntity<?> createItem(@RequestBody ItemDTO dto, @RequestHeader("X-User-Id") Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Item item = new Item();
        item.setUser(user);
        item.setItemName(dto.getItemName());
        item.setType(dto.getType());
        item.setCategory(dto.getCategory());
        item.setDescription(dto.getDescription());
        item.setEventDate(dto.getEventDate());
        item.setLocation(dto.getLocation());
        item.setStatus(Item.ItemStatus.OPEN);
        item.setReportId(dto.getType().name() + "-" + LocalDate.now().getYear() + "-" + (1000 + new Random().nextInt(9000)));

        Item saved = itemRepository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}`,

    'AuthController.java': `@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (userRepository.existsByCollegeEmail(req.collegeEmail)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already registered.");
        }
        if (userRepository.existsByStudentId(req.studentId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Student ID already registered.");
        }

        String hashedPassword = passwordEncoder.encode(req.password);
        User user = new User(req.fullName, req.collegeEmail, req.studentId, req.phone, hashedPassword);
        User saved = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(saved));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        User user = userRepository.findByCollegeEmail(req.collegeEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(req.password, user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
        }

        return ResponseEntity.ok(new AuthResponse(user));
    }
}`,

    'Item.java (Entity)': `@Entity
@Table(name = "items")
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_id", unique = true, nullable = false)
    private String reportId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType type; // LOST or FOUND

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(nullable = false)
    private String location;

    @Enumerated(EnumType.STRING)
    private ItemStatus status = ItemStatus.OPEN; // OPEN, RESOLVED, CLAIMED

    // Constructors, Getters & Setters
}`,

    'User.java (Entity)': `@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "college_email", unique = true, nullable = false)
    private String collegeEmail;

    @Column(name = "student_id", unique = true, nullable = false)
    private String studentId;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role = Role.STUDENT;

    // Constructors, Getters & Setters
}`,

    'ItemRepository.java': `@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    Optional<Item> findByReportId(String reportId);
    List<Item> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Item> findByTypeOrderByCreatedAtDesc(Item.ItemType type);

    @Query("SELECT i FROM Item i WHERE " +
           "(:type IS NULL OR i.type = :type) AND " +
           "(:category IS NULL OR i.category = :category) AND " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:search IS NULL OR LOWER(i.itemName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Item> searchItems(
        @Param("type") Item.ItemType type,
        @Param("category") String category,
        @Param("status") Item.ItemStatus status,
        @Param("search") String search
    );

    long countByType(Item.ItemType type);
    long countByStatus(Item.ItemStatus status);
}`,

    'application.properties': `# Spring Boot & MySQL Configuration
server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/campus_lost_found?createDatabaseIfNotExist=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=root123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect`
  };

  const SQL_SCHEMA = `-- Campus Lost & Found System - MySQL DDL Script
CREATE DATABASE IF NOT EXISTS campus_lost_found;
USE campus_lost_found;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    college_email VARCHAR(150) NOT NULL UNIQUE,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'FACULTY', 'ADMIN') DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (college_email),
    INDEX idx_user_student_id (student_id)
) ENGINE=InnoDB;

-- 2. Items Table
CREATE TABLE IF NOT EXISTS items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    type ENUM('LOST', 'FOUND') NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    approx_time VARCHAR(50),
    location VARCHAR(150) NOT NULL,
    color VARCHAR(50),
    brand VARCHAR(80),
    identifying_details TEXT,
    contact_preference ENUM('EMAIL', 'PHONE', 'PLATFORM') DEFAULT 'PLATFORM',
    image_url TEXT,
    status ENUM('OPEN', 'RESOLVED', 'CLAIMED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_item_type (type),
    INDEX idx_item_category (category),
    INDEX idx_item_status (status)
) ENGINE=InnoDB;

-- 3. Claims Table
CREATE TABLE IF NOT EXISTS claims (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    claimant_user_id BIGINT NOT NULL,
    owner_user_id BIGINT NOT NULL,
    reason TEXT NOT NULL,
    additional_details TEXT,
    proof_details TEXT,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (claimant_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg sm:text-xl tracking-tight">
                  Campus Lost & Found — Project Architecture & Viva Hub
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30">
                  2nd Year CE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Full-Stack Reference: Java Spring Boot + Spring Data JPA + MySQL + REST API + JavaScript Fetch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto bg-slate-100 border-b border-slate-200 p-1.5 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'architecture' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Architecture & Layers</span>
          </button>

          <button
            onClick={() => setActiveTab('java_code')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'java_code' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Java Spring Boot Code</span>
          </button>

          <button
            onClick={() => setActiveTab('mysql')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'mysql' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>MySQL Schema & DDL</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'api' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>REST API Docs</span>
          </button>

          <button
            onClick={() => setActiveTab('tech_roles')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'tech_roles' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Java vs JS Roles</span>
          </button>

          <button
            onClick={() => setActiveTab('viva')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'viva' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Viva Q&A Guide</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6 text-sm text-slate-700">
          
          {/* TAB 1: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100">
                <h3 className="font-extrabold text-blue-900 text-base">
                  3-Tier Full-Stack Enterprise Architecture
                </h3>
                <p className="text-xs text-blue-700 mt-1">
                  Standard architectural model required for Engineering Curriculum and University Practicals.
                </p>
              </div>

              {/* ASCII / Diagram Flow */}
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {`[CLIENT BROWSER: HTML5 / TailwindCSS / JavaScript]
                     │
                     │  1. fetch('/api/items') with JSON & Bearer Token
                     ▼
[CONTROLLER LAYER: Spring Boot @RestController]
  • AuthController: Handles register/login, returns JWT/Auth tokens
  • ItemController: Validates input, handles CRUD for Lost & Found
  • ClaimController: Manages ownership claim submission & approval
                     │
                     │  2. Service / Business Logic Layer (DTO validation)
                     ▼
[SERVICE & DATA ACCESS LAYER: Spring Data JPA & Hibernate ORM]
  • UserRepository, ItemRepository, ClaimRepository
  • Maps Java Entities (@Entity) to SQL rows automatically
                     │
                     │  3. JDBC Driver (com.mysql.cj.jdbc.Driver)
                     ▼
[DATABASE LAYER: MySQL 8.0 InnoDB Engine]
  • users table: Stores salted BCrypt password hashes, student ID
  • items table: Stores reports with foreign keys to users
  • claims table: Links item with claimant & owner for verification`}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="font-bold text-blue-700 block mb-1">Presentation Layer (Frontend)</span>
                  <p className="text-slate-600">
                    HTML5, TailwindCSS, and JavaScript fetch API. Handles real-time search, UI state, client-side validation, and token storage.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="font-bold text-indigo-700 block mb-1">Application Layer (Java)</span>
                  <p className="text-slate-600">
                    Java 17 with Spring Boot 3.2. Provides REST endpoints, BCrypt hashing, Spring Data JPA repositories, and CORS configuration.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="font-bold text-emerald-700 block mb-1">Database Layer (MySQL)</span>
                  <p className="text-slate-600">
                    Relational storage with foreign key constraints (ON DELETE CASCADE), indexes for rapid item filtering, and ACID transactions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JAVA CODE VIEWER */}
          {activeTab === 'java_code' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(JAVA_FILES).map((fileName) => (
                    <button
                      key={fileName}
                      onClick={() => setSelectedFile(fileName)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                        selectedFile === fileName
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {fileName}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => copyText(selectedFile, JAVA_FILES[selectedFile])}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  {copied === selectedFile ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === selectedFile ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 font-mono text-xs overflow-x-auto max-h-[450px]">
                <pre>{JAVA_FILES[selectedFile]}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: MYSQL DDL SCHEMA */}
          {activeTab === 'mysql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    MySQL Schema & Table Definitions (InnoDB)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ready to execute in MySQL Workbench or terminal command line.
                  </p>
                </div>

                <button
                  onClick={() => copyText('mysql_schema', SQL_SCHEMA)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  {copied === 'mysql_schema' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy SQL Script</span>
                </button>
              </div>

              <div className="bg-slate-900 text-emerald-400 rounded-2xl p-4 font-mono text-xs overflow-x-auto max-h-[450px]">
                <pre>{SQL_SCHEMA}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: REST API DOCS */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">
                RESTful API Specification
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Endpoint</th>
                      <th className="px-4 py-3">Payload / Params</th>
                      <th className="px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-blue-600">POST</td>
                      <td className="px-4 py-2.5 font-mono">/api/auth/register</td>
                      <td className="px-4 py-2.5 font-mono text-[11px]">{`{ fullName, collegeEmail, studentId, password }`}</td>
                      <td className="px-4 py-2.5">Registers student with hashed password</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-blue-600">POST</td>
                      <td className="px-4 py-2.5 font-mono">/api/auth/login</td>
                      <td className="px-4 py-2.5 font-mono text-[11px]">{`{ collegeEmail, password }`}</td>
                      <td className="px-4 py-2.5">Authenticates credentials, returns session token</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-emerald-600">GET</td>
                      <td className="px-4 py-2.5 font-mono">/api/items</td>
                      <td className="px-4 py-2.5 font-mono text-[11px]">?search=&type=&category=&status=</td>
                      <td className="px-4 py-2.5">Search and filter active reports in MySQL</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-blue-600">POST</td>
                      <td className="px-4 py-2.5 font-mono">/api/items</td>
                      <td className="px-4 py-2.5 font-mono text-[11px]">{`{ itemName, type, category, location, date... }`}</td>
                      <td className="px-4 py-2.5">Creates new report, generates unique Report ID</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-amber-600">PUT</td>
                      <td className="px-4 py-2.5 font-mono">/api/items/{`{id}`}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px]">{`{ itemName, description, status... }`}</td>
                      <td className="px-4 py-2.5">Updates report details (reporter or admin only)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-rose-600">DELETE</td>
                      <td className="px-4 py-2.5 font-mono">/api/items/{`{id}`}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px]">None</td>
                      <td className="px-4 py-2.5">Deletes report from MySQL database</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-blue-600">POST</td>
                      <td className="px-4 py-2.5 font-mono">/api/items/{`{id}`}/claims</td>
                      <td className="px-4 py-2.5 font-mono text-[11px]">{`{ reason, proofDetails }`}</td>
                      <td className="px-4 py-2.5">Submits claim on a found item</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-amber-600">PUT</td>
                      <td className="px-4 py-2.5 font-mono">/api/claims/{`{id}`}/accept</td>
                      <td className="px-4 py-2.5 font-mono text-[11px]">None</td>
                      <td className="px-4 py-2.5">Accepts claim, marks item as Resolved/Returned</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: WHERE JAVA & JAVASCRIPT ARE USED */}
          {activeTab === 'tech_roles' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">
                Explanation: Where Java vs JavaScript Are Utilized
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      Java
                    </span>
                    <h4 className="font-bold text-indigo-900">Backend Server (Spring Boot)</h4>
                  </div>
                  <ul className="text-xs space-y-2 text-indigo-950">
                    <li>• <strong>REST Controllers:</strong> Expose HTTP endpoints with <code>@RestController</code> and <code>@RequestMapping</code>.</li>
                    <li>• <strong>ORM & JPA:</strong> Connects to MySQL using Hibernate; generates queries automatically.</li>
                    <li>• <strong>Security & BCrypt:</strong> Hashes user passwords with random salt strings; prevents plaintext leaks.</li>
                    <li>• <strong>Data Integrity:</strong> Enforces unique Student ID, unique college email, and database foreign keys.</li>
                    <li>• <strong>Business Logic:</strong> Automatically updates item state to RESOLVED when claims are accepted.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                      JS
                    </span>
                    <h4 className="font-bold text-amber-900">Frontend Client (JavaScript / AJAX)</h4>
                  </div>
                  <ul className="text-xs space-y-2 text-amber-950">
                    <li>• <strong>Asynchronous fetch():</strong> Calls Java REST endpoints without reloading the browser page.</li>
                    <li>• <strong>Client-side Validation:</strong> Checks email regex, non-empty fields, and password matching before sending.</li>
                    <li>• <strong>Dynamic Filtering:</strong> Filters items instantly by keyword, category, status, and campus location.</li>
                    <li>• <strong>Session State:</strong> Maintains login status across page refreshes using tokens and localStorage.</li>
                    <li>• <strong>Image Handling:</strong> Converts camera photos or local files to base64 data for upload.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: VIVA QUESTIONS */}
          {activeTab === 'viva' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">
                2nd Year Engineering Viva Examination Questions & Answers
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <strong className="text-slate-900 block font-bold mb-1">
                    Q1: What is Spring Data JPA and why did you use it instead of raw JDBC?
                  </strong>
                  <p className="text-slate-700 leading-relaxed">
                    Raw JDBC requires writing boilerplate <code>PreparedStatement</code>, mapping result sets manually, and managing database connections. Spring Data JPA with Hibernate acts as an Object-Relational Mapper (ORM), automatically translating Java classes (<code>@Entity</code>) into MySQL tables and providing built-in CRUD operations via <code>JpaRepository</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <strong className="text-slate-900 block font-bold mb-1">
                    Q2: How do you prevent SQL Injection and unauthorized access?
                  </strong>
                  <p className="text-slate-700 leading-relaxed">
                    1) SQL Injection is prevented because Spring Data JPA uses parameterized queries (<code>:param</code>) under the hood. 2) Plaintext passwords are never stored; they are hashed with <code>BCryptPasswordEncoder</code> using a cryptographic salt. 3) Ownership checks ensure only the user who posted an item can edit or delete it.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <strong className="text-slate-900 block font-bold mb-1">
                    Q3: How does data persistence work when a user logs out and logs in again?
                  </strong>
                  <p className="text-slate-700 leading-relaxed">
                    Data is stored persistently in MySQL database tables on the server disk. When a user logs in again with their college credentials, the backend authenticates them against the <code>users</code> table, and fetches their reports from the <code>items</code> table using their unique primary key ID.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <strong className="text-slate-900 block font-bold mb-1">
                    Q4: How does the claim verification system prevent false claims?
                  </strong>
                  <p className="text-slate-700 leading-relaxed">
                    Found items conceal identifying marks or serial numbers. A claimant must submit a claim with specific proof details. The founder reviews these claims, and only when satisfied, clicks "Accept Claim", which updates the item status in MySQL to "RESOLVED" and records the transaction in the <code>claims</code> table.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            Source files stored in /campus-lost-found/backend/
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Close Architecture Hub
          </button>
        </div>

      </div>
    </div>
  );
};
