package com.kothari.dashboard.config;

import com.kothari.dashboard.asset.entity.Asset;
import com.kothari.dashboard.asset.entity.AssetStatus;
import com.kothari.dashboard.asset.entity.AssetType;
import com.kothari.dashboard.asset.repository.AssetRepository;
import com.kothari.dashboard.auth.entity.Role;
import com.kothari.dashboard.auth.entity.User;
import com.kothari.dashboard.auth.repository.UserRepository;
import com.kothari.dashboard.auth.service.MfaService;
import com.kothari.dashboard.employee.entity.Allocation;
import com.kothari.dashboard.employee.entity.AllocationStatus;
import com.kothari.dashboard.employee.entity.Employee;
import com.kothari.dashboard.employee.entity.EmployeeStatus;
import com.kothari.dashboard.employee.repository.AllocationRepository;
import com.kothari.dashboard.employee.repository.EmployeeRepository;
import com.kothari.dashboard.olx.entity.OlxListing;
import com.kothari.dashboard.olx.entity.OlxListingStatus;
import com.kothari.dashboard.olx.entity.OlxSale;
import com.kothari.dashboard.olx.entity.PaymentMode;
import com.kothari.dashboard.olx.repository.OlxListingRepository;
import com.kothari.dashboard.olx.repository.OlxSaleRepository;
import com.kothari.dashboard.task.entity.TaskItem;
import com.kothari.dashboard.task.entity.TaskPriority;
import com.kothari.dashboard.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Initial Seed Component:
 * Seeds the single CEO/Owner account, baseline employees, inventory assets,
 * active allocations, and initial OLX salvage pipeline upon first boot.
 * All relational tables strictly adhere to 1NF, 2NF, 3NF, and BCNF normalization.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final AssetRepository assetRepository;
    private final AllocationRepository allocationRepository;
    private final OlxListingRepository olxListingRepository;
    private final OlxSaleRepository olxSaleRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;
    private final MfaService mfaService;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("No accounts found. Seeding initial CEO/Owner administrator account...");

            var key = mfaService.generateSecretKey();
            String defaultPassword = "KothariAdmin@2026!";

            User owner = User.builder()
                    .username("admin")
                    .email("admin@kothari.com")
                    .passwordHash(passwordEncoder.encode(defaultPassword))
                    .role(Role.ROLE_OWNER)
                    .mfaEnabled(false) // Initially false until first QR scan setup
                    .mfaSecret(key.getKey())
                    .tokenVersion(1)
                    .failedLoginAttempts(0)
                    .build();

            owner = userRepository.save(owner);

            log.info("=================================================================");
            log.info("INITIAL ADMIN ACCOUNT SEEDED SUCCESSFULLY");
            log.info("Username: admin");
            log.info("Default Password: [REDACTED — check your deployment configuration or contact the system administrator]");
            log.info("MFA Secret: [REDACTED — stored securely in the database]");
            log.info("Setup URL: {}", mfaService.getOtpAuthUrl("admin", key.getKey()));
            log.info("Please log in and configure your Google Authenticator 2FA immediately.");
            log.info("=================================================================");

            seedDomainData(owner);
        }
    }

    private void seedDomainData(User owner) {
        log.info("Seeding baseline enterprise data (Staff, Assets, Allocations, OLX Pipeline)...");

        // 1. Employees
        Employee emp1 = Employee.builder()
                .ownerId(owner.getId())
                .employeeCode("EMP-1001")
                .fullName("Rahul Sharma")
                .email("rahul.sharma@kothari.com")
                .phone("+91 98250 11223")
                .department("Information Technology")
                .designation("Senior Systems Engineer")
                .status(EmployeeStatus.ACTIVE)
                .joiningDate(LocalDate.of(2023, 4, 15))
                .notes("Primary hardware custodian for field operations")
                .build();

        Employee emp2 = Employee.builder()
                .ownerId(owner.getId())
                .employeeCode("EMP-1002")
                .fullName("Priya Patel")
                .email("priya.patel@kothari.com")
                .phone("+91 98251 33445")
                .department("Accounts & Taxation")
                .designation("Chief Accountant")
                .status(EmployeeStatus.ACTIVE)
                .joiningDate(LocalDate.of(2022, 8, 1))
                .notes("GST billing and financial audit signatory")
                .build();

        Employee emp3 = Employee.builder()
                .ownerId(owner.getId())
                .employeeCode("EMP-1003")
                .fullName("Amit Verma")
                .email("amit.verma@kothari.com")
                .phone("+91 98252 55667")
                .department("Logistics & Warehouse")
                .designation("Depot Dispatch Head")
                .status(EmployeeStatus.ACTIVE)
                .joiningDate(LocalDate.of(2024, 1, 10))
                .notes("Ring Road Depot inventory manager")
                .build();

        emp1 = employeeRepository.save(emp1);
        emp2 = employeeRepository.save(emp2);
        emp3 = employeeRepository.save(emp3);

        // 2. Hardware Assets (with strictly normalized employee foreign key)
        Asset laptop1 = Asset.builder()
                .ownerId(owner.getId())
                .assetTag("KD-LAP-001")
                .name("MacBook Pro 14 M3 Pro")
                .type(AssetType.LAPTOP)
                .serialNumber("MBP14-2024-001")
                .brand("Apple")
                .model("MacBook Pro 14 (A2992)")
                .purchaseDate(LocalDate.of(2024, 2, 10))
                .purchaseCost(BigDecimal.valueOf(189000.00))
                .warrantyExpiry(LocalDate.of(2027, 2, 10))
                .status(AssetStatus.ALLOCATED)
                .condition("Excellent")
                .location("Executive Office, Surat")
                .assignedEmployee(emp1)
                .notes("Allocated for executive field diagnostics")
                .build();

        Asset laptop2 = Asset.builder()
                .ownerId(owner.getId())
                .assetTag("KD-LAP-006")
                .name("Lenovo ThinkPad T480")
                .type(AssetType.LAPTOP)
                .serialNumber("LNV-8842-X1")
                .brand("Lenovo")
                .model("ThinkPad T480")
                .purchaseDate(LocalDate.of(2020, 6, 15))
                .purchaseCost(BigDecimal.valueOf(68000.00))
                .status(AssetStatus.SALVAGE_OLX)
                .condition("Refurbished - Grade A")
                .location("Surat Central Warehouse")
                .assignedEmployee(null)
                .notes("Decommissioned after 5yr lease lifecycle. Listed on OLX.")
                .build();

        Asset desktop1 = Asset.builder()
                .ownerId(owner.getId())
                .assetTag("KD-DSK-003")
                .name("Dell OptiPlex 7050 Tower")
                .type(AssetType.DESKTOP)
                .serialNumber("DLL-OPT-7050-99")
                .brand("Dell")
                .model("OptiPlex 7050 MT")
                .purchaseDate(LocalDate.of(2019, 11, 20))
                .purchaseCost(BigDecimal.valueOf(52000.00))
                .status(AssetStatus.DISPOSED)
                .condition("Used - Good")
                .location("Surat Office")
                .assignedEmployee(null)
                .notes("Sold on OLX to Apex Prints for POS counter.")
                .build();

        Asset printer1 = Asset.builder()
                .ownerId(owner.getId())
                .assetTag("KD-PRT-004")
                .name("HP LaserJet Pro M404dn")
                .type(AssetType.PRINTER)
                .serialNumber("HPL-404-58210")
                .brand("HP")
                .model("LaserJet Pro M404dn")
                .purchaseDate(LocalDate.of(2021, 3, 12))
                .purchaseCost(BigDecimal.valueOf(31000.00))
                .status(AssetStatus.SALVAGE_OLX)
                .condition("Used - Like New")
                .location("Ring Road Depot")
                .assignedEmployee(null)
                .notes("Surplus commercial duplex printer in negotiation.")
                .build();

        Asset switch1 = Asset.builder()
                .ownerId(owner.getId())
                .assetTag("KD-NET-003")
                .name("Cisco Catalyst 2960-X Managed Switch")
                .type(AssetType.NETWORK_EQUIPMENT)
                .serialNumber("CSCO-2960X-774")
                .brand("Cisco")
                .model("Catalyst WS-C2960X-24TS-L")
                .purchaseDate(LocalDate.of(2019, 7, 25))
                .purchaseCost(BigDecimal.valueOf(48000.00))
                .status(AssetStatus.DISPOSED)
                .condition("Refurbished - Tested 100%")
                .location("Central Server Room")
                .assignedEmployee(null)
                .notes("Sold on OLX for network salvage.")
                .build();

        laptop1 = assetRepository.save(laptop1);
        laptop2 = assetRepository.save(laptop2);
        desktop1 = assetRepository.save(desktop1);
        printer1 = assetRepository.save(printer1);
        switch1 = assetRepository.save(switch1);

        // 3. Custody Allocation (Normalized)
        Allocation alloc1 = Allocation.builder()
                .ownerId(owner.getId())
                .asset(laptop1)
                .employee(emp1)
                .receiptNumber("REC-2024-001")
                .issueDate(LocalDate.of(2024, 2, 12))
                .expectedReturnDate(LocalDate.of(2027, 2, 12))
                .issueCondition("Mint")
                .status(AllocationStatus.ACTIVE)
                .undertakingAccepted(true)
                .authorizedBy("admin")
                .returnNotes(null)
                .build();
        allocationRepository.save(alloc1);

        // 4. OLX Listings
        OlxListing listing1 = OlxListing.builder()
                .ownerId(owner.getId())
                .asset(laptop2)
                .title("Lenovo ThinkPad T480 - Core i5 8th Gen / 16GB / 512GB SSD / Good Battery")
                .category("Laptops")
                .askingPrice(BigDecimal.valueOf(22500.00))
                .expectedPrice(BigDecimal.valueOf(20000.00))
                .status(OlxListingStatus.ACTIVE)
                .olxUrl("https://www.olx.in/item/lenovo-thinkpad-t480-core-i5-16gb-iid-1758923410")
                .olxAdId("1758923410")
                .viewsCount(142)
                .inquiriesCount(9)
                .listedDate(LocalDate.of(2026, 10, 20))
                .location("Surat Central Warehouse")
                .notes("Upgraded with new Kingston 512GB NVMe. Original 65W Type-C charger included.")
                .build();

        OlxListing listing2 = OlxListing.builder()
                .ownerId(owner.getId())
                .asset(desktop1)
                .title("Dell OptiPlex 7050 Tower - i7 7th Gen / 16GB RAM / 1TB HDD + 256GB SSD")
                .category("Desktops")
                .askingPrice(BigDecimal.valueOf(18500.00))
                .expectedPrice(BigDecimal.valueOf(16500.00))
                .status(OlxListingStatus.SOLD)
                .olxUrl("https://www.olx.in/item/dell-optiplex-7050-tower-i7-iid-1759102844")
                .olxAdId("1759102844")
                .viewsCount(218)
                .inquiriesCount(14)
                .listedDate(LocalDate.of(2026, 10, 24))
                .location("Surat Office")
                .notes("Sold for POS cash counter use. Tested on-site with billing software.")
                .build();

        OlxListing listing3 = OlxListing.builder()
                .ownerId(owner.getId())
                .asset(printer1)
                .title("HP LaserJet Pro M404dn High-Speed Duplex Printer - Excellent Drum Life")
                .category("Printers")
                .askingPrice(BigDecimal.valueOf(14000.00))
                .expectedPrice(BigDecimal.valueOf(12500.00))
                .status(OlxListingStatus.NEGOTIATING)
                .olxUrl("https://www.olx.in/item/hp-laserjet-pro-m404dn-duplex-iid-1759001423")
                .olxAdId("1759001423")
                .viewsCount(89)
                .inquiriesCount(6)
                .listedDate(LocalDate.of(2026, 10, 22))
                .location("Ring Road Depot")
                .notes("Customer offered ₹12,000; counter-offered ₹12,500. Pickup scheduled for tomorrow.")
                .build();

        OlxListing listing4 = OlxListing.builder()
                .ownerId(owner.getId())
                .asset(switch1)
                .title("Cisco Catalyst 2960-X 24-Port Gigabit Managed Switch with SFP")
                .category("Network")
                .askingPrice(BigDecimal.valueOf(16000.00))
                .expectedPrice(BigDecimal.valueOf(14000.00))
                .status(OlxListingStatus.SOLD)
                .olxUrl("https://www.olx.in/item/cisco-catalyst-2960-x-24-port-iid-1758781900")
                .olxAdId("1758781900")
                .viewsCount(165)
                .inquiriesCount(11)
                .listedDate(LocalDate.of(2026, 10, 18))
                .location("Central Server Room")
                .notes("Decommissioned enterprise switch.")
                .build();

        listing1 = olxListingRepository.save(listing1);
        listing2 = olxListingRepository.save(listing2);
        listing3 = olxListingRepository.save(listing3);
        listing4 = olxListingRepository.save(listing4);

        // 5. OlxSales for the sold units
        OlxSale sale1 = OlxSale.builder()
                .ownerId(owner.getId())
                .listing(listing2)
                .asset(desktop1)
                .saleReceiptNumber("SLV-2026-001")
                .soldPrice(BigDecimal.valueOf(17000.00))
                .buyerName("Vikram Joshi (Apex Prints)")
                .buyerPhone("+91 98251 44321")
                .paymentMode(PaymentMode.UPI)
                .dateSold(LocalDate.now()) // Sold today!
                .notes("Sold for POS billing counter.")
                .build();

        OlxSale sale2 = OlxSale.builder()
                .ownerId(owner.getId())
                .listing(listing4)
                .asset(switch1)
                .saleReceiptNumber("SLV-2026-002")
                .soldPrice(BigDecimal.valueOf(14500.00))
                .buyerName("Anil Shah (Gujarat Fibers)")
                .buyerPhone("+91 97234 11889")
                .paymentMode(PaymentMode.BANK_TRANSFER)
                .dateSold(LocalDate.of(2026, 10, 27))
                .notes("Sold with power cable and rack mounts.")
                .build();

        olxSaleRepository.save(sale1);
        olxSaleRepository.save(sale2);

        // 6. Executive CEO Tasks
        TaskItem t1 = TaskItem.builder()
                .ownerId(owner.getId())
                .title("Sign off quarterly IT physical stocktake for Branch B")
                .priority(TaskPriority.CRITICAL)
                .category("IT ASSETS")
                .due("TODAY 17:00")
                .completed(false)
                .build();

        TaskItem t2 = TaskItem.builder()
                .ownerId(owner.getId())
                .title("Verify OLX payment received for 2 sold Lenovo ThinkPads")
                .priority(TaskPriority.HIGH)
                .category("OLX SALES")
                .due("TODAY 18:30")
                .completed(false)
                .build();

        TaskItem t3 = TaskItem.builder()
                .ownerId(owner.getId())
                .title("Approve allocation of Dell 24\" Monitors to Billing Desk")
                .priority(TaskPriority.NORMAL)
                .category("IT ASSETS")
                .due("TODAY 19:00")
                .completed(true)
                .completedAt(LocalDateTime.now().minusHours(2))
                .build();

        TaskItem t4 = TaskItem.builder()
                .ownerId(owner.getId())
                .title("Review weekly hours report and overtime entries")
                .priority(TaskPriority.NORMAL)
                .category("OPERATIONS")
                .due("TOMORROW 10:00")
                .completed(true)
                .completedAt(LocalDateTime.now().minusHours(1))
                .build();

        TaskItem t5 = TaskItem.builder()
                .ownerId(owner.getId())
                .title("Import latest vendor hardware invoices via Excel")
                .priority(TaskPriority.HIGH)
                .category("OPERATIONS")
                .due("TOMORROW 14:00")
                .completed(true)
                .completedAt(LocalDateTime.now().minusMinutes(30))
                .build();

        taskRepository.save(t1);
        taskRepository.save(t2);
        taskRepository.save(t3);
        taskRepository.save(t4);
        taskRepository.save(t5);

        log.info("Baseline enterprise seed data created successfully!");
    }
}
