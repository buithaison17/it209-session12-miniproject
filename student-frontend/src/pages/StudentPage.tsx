import {
    useState,
    useMemo,
    type ChangeEvent,
    type FocusEvent,
    type FormEvent,
    useEffect,
} from "react";
import {
    Users,
    UserPlus,
    Search,
    Edit2,
    Trash2,
    X,
    CheckCircle2,
    AlertCircle,
    Phone,
    Mail,
    MapPin,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    AlertTriangle,
    Building,
    User,
} from "lucide-react";
import { useStudentStore } from "../store/studentStore";
import type { Student } from "../types/student";

interface StudentFormData {
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
}

type FormErrors = Record<keyof StudentFormData, string>;

interface ToastNotification {
    id: number;
    message: string;
    type: "success" | "error" | "info";
}

const INITIAL_FORM_DATA: StudentFormData = {
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
};

const INITIAL_ERRORS: FormErrors = {
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
};

export default function StudentPage() {
    const {
        students,
        getAllStudents,
        createStudent,
        updateStudent,
        deleteStudent,
    } = useStudentStore();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [statusFilter] = useState<"all" | "active" | "inactive">("all");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deleteConfirmStudent, setDeleteConfirmStudent] =
        useState<Student | null>(null);

    // Form State & Custom Validation Errors State (Tuyệt đối không dùng HTML required)
    const [formData, setFormData] =
        useState<StudentFormData>(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState<FormErrors>(INITIAL_ERRORS);
    const [touched, setTouched] = useState<
        Record<keyof StudentFormData, boolean>
    >({
        name: false,
        email: false,
        phoneNumber: false,
        address: false,
    });

    // Notification state
    const [toast, setToast] = useState<ToastNotification | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const init = async () => {
            await getAllStudents();
        };
        init();
    }, []);

    const showToast = (
        message: string,
        type: "success" | "error" | "info" = "success",
    ) => {
        setToast({ id: Date.now(), message, type });
        setTimeout(() => {
            setToast(null);
        }, 3500);
    };

    const validateField = (
        name: keyof StudentFormData,
        value: string,
    ): string => {
        const trimmedVal = value.trim();

        switch (name) {
            case "name":
                if (!trimmedVal) {
                    return "Tên không được để trống";
                }
                if (trimmedVal.length < 2) {
                    return "Họ và tên phải có ít nhất 2 ký tự";
                }
                return "";

            case "email":
                if (!trimmedVal) {
                    return "Email không được để trống";
                }
                // Chuẩn RFC 5322 regex cho email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(trimmedVal)) {
                    return "Email không hợp lệ";
                }
                return "";

            case "phoneNumber":
                if (!trimmedVal) {
                    return "Số điện thoại không được để trống";
                }
                // Định dạng SĐT tiêu chuẩn Việt Nam: 10 chữ số bắt đầu bằng 03, 05, 07, 08, 09 hoặc +84
                const cleanPhone = trimmedVal.replace(/[\s.-]/g, "");
                const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
                if (!phoneRegex.test(cleanPhone)) {
                    return "Số điện thoại không hợp lệ (Ví dụ: 0912345678)";
                }
                return "";

            case "address":
                if (!trimmedVal) {
                    return "Địa chỉ không được để trống";
                }
                if (trimmedVal.length < 5) {
                    return "Địa chỉ cần chi tiết hơn (tối thiểu 5 ký tự)";
                }
                return "";

            default:
                return "";
        }
    };

    const validateAll = (): boolean => {
        const newErrors: FormErrors = {
            name: validateField("name", formData.name),
            email: validateField("email", formData.email),
            phoneNumber: validateField("phoneNumber", formData.phoneNumber),
            address: validateField("address", formData.address),
        };

        setErrors(newErrors);
        setTouched({
            name: true,
            email: true,
            phoneNumber: true,
            address: true,
        });

        return !Object.values(newErrors).some((msg) => msg !== "");
    };

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        const fieldName = name as keyof StudentFormData;

        setFormData((prev) => ({
            ...prev,
            [fieldName]: value,
        }));

        // Nếu trường đó đã từng được chạm hoặc đã có lỗi, validate trực tiếp
        if (touched[fieldName]) {
            const errorMsg = validateField(fieldName, value);
            setErrors((prev) => ({
                ...prev,
                [fieldName]: errorMsg,
            }));
        }
    };

    const handleBlur = (
        e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        const fieldName = name as keyof StudentFormData;

        setTouched((prev) => ({ ...prev, [fieldName]: true }));
        const errorMsg = validateField(fieldName, value);
        setErrors((prev) => ({
            ...prev,
            [fieldName]: errorMsg,
        }));
    };

    const handleOpenAddModal = () => {
        setEditingStudent(null);
        setFormData(INITIAL_FORM_DATA);
        setErrors(INITIAL_ERRORS);
        setTouched({
            name: false,
            email: false,
            phoneNumber: false,
            address: false,
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            name: student.name,
            email: student.email,
            phoneNumber: student.phoneNumber,
            address: student.address,
        });
        setErrors(INITIAL_ERRORS);
        setTouched({
            name: false,
            email: false,
            phoneNumber: false,
            address: false,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStudent(null);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Thực hiện validate hoàn toàn bằng React State
        const isValid = validateAll();
        if (!isValid) {
            return;
        }

        if (editingStudent) {
            await updateStudent(editingStudent.id, { ...formData });
            showToast("Sửa sinh viên thành công");
        } else {
            await createStudent({
                ...formData,
            });
            showToast("Thêm sinh viên thành công", "success");
        }

        await getAllStudents();
        handleCloseModal();
    };

    const handleDelete = async () => {
        if (!deleteConfirmStudent) return;
        await deleteStudent(deleteConfirmStudent.id);
        showToast(
            `Đã xóa sinh viên "${deleteConfirmStudent.name}" khỏi hệ thống!`,
            "error",
        );
        setDeleteConfirmStudent(null);
        await getAllStudents();
    };

    const filteredStudents = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        return students.filter((s) => {
            const matchSearch =
                s.name.toLowerCase().includes(term) ||
                s.email.toLowerCase().includes(term) ||
                s.phoneNumber.includes(term) ||
                s.address.toLowerCase().includes(term) ||
                s.id.toString().toLowerCase().includes(term);

            return matchSearch;
        });
    }, [students, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredStudents.slice(start, start + itemsPerPage);
    }, [filteredStudents, currentPage]);

    const getInitials = (name: string): string => {
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col font-sans">
            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border transition-all duration-300 transform translate-y-0 ${
                        toast.type === "error"
                            ? "bg-rose-50 border-rose-200 text-rose-800"
                            : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    }`}
                >
                    {toast.type === "error" ? (
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    )}
                    <span className="text-sm font-semibold">
                        {toast.message}
                    </span>
                </div>
            )}

            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl The class `bg-gradient-to-tr` can be written as `bg-linear-to-tr` from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                                UniManage Pro
                            </h1>
                            <p className="text-xs text-slate-500">
                                Hệ thống Quản lý Sinh viên Chuẩn hóa
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Máy chủ hoạt động
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Toolbar & Filter Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                        <div className="relative w-full sm:w-80">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Tìm theo tên, email, SĐT, mã SV..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleOpenAddModal}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-medium text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Thêm sinh viên</span>
                    </button>
                </div>

                {/* Student Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-3.5 px-4 text-center w-14">
                                        #
                                    </th>
                                    <th className="py-3.5 px-6">
                                        Mã SV & Họ Tên
                                    </th>
                                    <th className="py-3.5 px-6">Liên hệ</th>
                                    <th className="py-3.5 px-6">Địa chỉ</th>
                                    {/* <th className="py-3.5 px-4 text-center">
                                        Trạng thái
                                    </th> */}
                                    <th className="py-3.5 px-6 text-right">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {paginatedStudents.length > 0 ? (
                                    paginatedStudents.map((student, idx) => (
                                        <tr
                                            key={student.id}
                                            className="hover:bg-indigo-50/30 transition-colors group"
                                        >
                                            <td className="py-4 px-4 text-center text-slate-400 font-mono text-xs">
                                                {(currentPage - 1) *
                                                    itemsPerPage +
                                                    idx +
                                                    1}
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-600/10 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
                                                        {getInitials(
                                                            student.name,
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                            {student.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 space-y-1">
                                                <div className="flex items-center gap-2 text-slate-600 text-xs">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate The class `max-w-[200px]` can be written as `max-w-50`">
                                                        {student.email}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600 text-xs">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="font-mono">
                                                        {student.phoneNumber}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600 The class `max-w-[240px]` can be written as `max-w-60`">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate">
                                                        {student.address}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* <td className="py-4 px-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        student.status ===
                                                        "active"
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : "bg-slate-100 text-slate-600 border border-slate-200"
                                                    }`}
                                                >
                                                    {student.status === "active"
                                                        ? "Đang học"
                                                        : "Tạm dừng"}
                                                </span>
                                            </td> */}

                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleOpenEditModal(
                                                                student,
                                                            )
                                                        }
                                                        title="Sửa thông tin"
                                                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setDeleteConfirmStudent(
                                                                student,
                                                            )
                                                        }
                                                        title="Xóa sinh viên"
                                                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-12 text-center text-slate-400"
                                        >
                                            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                                            <p className="text-sm font-medium">
                                                Không tìm thấy sinh viên phù hợp
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Hãy thử điều chỉnh từ khóa tìm
                                                kiếm hoặc lọc
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer / Pagination */}
                    <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                        <div>
                            Hiển thị{" "}
                            <span className="font-semibold text-slate-800">
                                {paginatedStudents.length}
                            </span>{" "}
                            /{" "}
                            <span className="font-semibold text-slate-800">
                                {filteredStudents.length}
                            </span>{" "}
                            sinh viên
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                aria-label="Trang trước"
                                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 font-medium text-slate-700">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <button
                                disabled={currentPage >= totalPages}
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1),
                                    )
                                }
                                aria-label="Trang sau"
                                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
                    <div
                        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                    {editingStudent ? (
                                        <Edit2 className="w-4 h-4" />
                                    ) : (
                                        <UserPlus className="w-4 h-4" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">
                                        {editingStudent
                                            ? "Cập Nhật Sinh Viên"
                                            : "Thêm Sinh Viên Mới"}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {editingStudent
                                            ? `Mã: ${editingStudent.id}`
                                            : "Điền đầy đủ các thông tin bên dưới"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                aria-label="Đóng modal"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body / Form (NO HTML5 REQUIRED) */}
                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="p-6 space-y-4"
                        >
                            {/* Field 1: Name */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                                    Họ và tên{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        placeholder="Ví dụ: Nguyễn Văn An"
                                        className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-all ${
                                            errors.name
                                                ? "border-rose-400 ring-2 ring-rose-100 focus:border-rose-500"
                                                : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                        }`}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 animate-fadeIn">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{errors.name}</span>
                                    </p>
                                )}
                            </div>

                            {/* Field 2: Email */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                                    Địa chỉ Email{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        placeholder="Ví dụ: an.nguyen@university.edu.vn"
                                        className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-all ${
                                            errors.email
                                                ? "border-rose-400 ring-2 ring-rose-100 focus:border-rose-500"
                                                : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                        }`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 animate-fadeIn">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{errors.email}</span>
                                    </p>
                                )}
                            </div>

                            {/* Field 3: Phone Number */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                                    Số điện thoại{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        placeholder="Ví dụ: 0912345678"
                                        className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-all ${
                                            errors.phoneNumber
                                                ? "border-rose-400 ring-2 ring-rose-100 focus:border-rose-500"
                                                : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                        }`}
                                    />
                                </div>
                                {errors.phoneNumber && (
                                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 animate-fadeIn">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{errors.phoneNumber}</span>
                                    </p>
                                )}
                            </div>

                            {/* Field 4: Address */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                                    Địa chỉ thường trú{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none text-slate-400">
                                        <Building className="w-4 h-4" />
                                    </div>
                                    <textarea
                                        rows={3}
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        placeholder="Ví dụ: Số 12 Chùa Bộc, Đống Đa, Hà Nội"
                                        className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-all resize-none ${
                                            errors.address
                                                ? "border-rose-400 ring-2 ring-rose-100 focus:border-rose-500"
                                                : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                                        }`}
                                    />
                                </div>
                                {errors.address && (
                                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 animate-fadeIn">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{errors.address}</span>
                                    </p>
                                )}
                            </div>

                            {/* Form Action Buttons */}
                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-200 transition cursor-pointer"
                                >
                                    {editingStudent
                                        ? "Cập nhật"
                                        : "Thêm sinh viên"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {}
            {deleteConfirmStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Xác nhận xóa sinh viên
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Bạn có chắc chắn muốn xóa sinh viên{" "}
                                <strong className="text-slate-800">
                                    {deleteConfirmStudent.name}
                                </strong>{" "}
                                (Mã: {deleteConfirmStudent.id})? Hành động này
                                không thể hoàn tác.
                            </p>
                        </div>
                        <div className="flex gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteConfirmStudent(null)}
                                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-md shadow-rose-200 transition cursor-pointer"
                            >
                                Xóa ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
