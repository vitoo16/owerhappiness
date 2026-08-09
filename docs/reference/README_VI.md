# Hướng dẫn sử dụng bộ tài liệu Portfolio

Bộ tài liệu này được viết theo format tài liệu phần mềm chuyên nghiệp để có thể đặt thẳng vào repository, dùng khi thiết kế, code, test, review kiến trúc và trình bày project với client/recruiter.

## Mốc hiện tại
Mục tiêu trước mắt là **Phase 8 - LOCAL COMPLETE**. Từ Phase 0 đến Phase 8, toàn bộ Web + API + PostgreSQL + Admin CMS + Case Study Builder + Media + GSAP + Private Desk phải chạy hoàn chỉnh ở local.

Các tài liệu Production/Deployment đã được thiết kế trước để tránh kiến trúc cụt đường, nhưng **không phải việc cần làm ngay**. Domain, Cloudflare, Ubuntu Server, production Docker, deploy FE/BE/DB, backup production và CI/CD chỉ bắt đầu sau khi Local Complete đã đạt.

## Thứ tự nên đọc
1. `01_Vision_BRD_and_Scope.md` - hiểu mục tiêu và phạm vi.
2. `02_SRS.md` - requirement chính thức, có ID FR/NFR.
3. `04_Software_Architecture_HLD.md` - kiến trúc tổng thể.
4. `06_Database_Design.md` + `07_API_Specification.md` - backend contract.
5. `08_UI_UX_and_Design_System.md` - visual/design/GSAP.
6. `09_Admin_CMS_and_Content_Model.md` - CMS và Case Study Builder.
7. `11_Test_Strategy_and_QA.md` - cách verify.
8. `12_Local_Development_Runbook.md` - cách chạy local.
9. `16_Project_Roadmap_WBS_Risk_ADR.md` - phase, risk, quyết định kiến trúc.
10. `17_Definition_of_Done_and_Checklists.md` - gate để biết phase đã thật sự xong hay chưa.

## Quy tắc quan trọng
- SRS là source of truth cho Requirement ID.
- Prisma schema sẽ trở thành source of truth cho database sau khi implement.
- OpenAPI sinh từ NestJS sẽ trở thành source of truth cho REST API sau khi contract ổn định.
- Case study dùng structured block thay vì raw HTML tự do.
- Backend luôn enforce authorization; frontend route guard chỉ là UX layer.
- Không hardcode project/milestone sau khi CMS hoàn tất.
