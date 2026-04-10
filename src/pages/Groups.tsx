import { useState, useEffect } from "react";
import { groupApi, permissionApi, Group, Permission } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Shield, Settings2, Trash2, Loader2, Lock, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";

function DeleteConfirmDialog({
  open, groupName, onConfirm, onCancel,
}: {
  open: boolean; groupName: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-sm p-0 border-none rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 flex flex-col items-center text-center gap-4" dir="rtl">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 mb-1">تأكيد الحذف</h2>
            <p className="text-sm text-slate-500 font-medium">
              هل أنت متأكد من حذف مجموعة
              <span className="font-black text-rose-500 mx-1">"{groupName}"</span>؟
            </p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <Button onClick={onConfirm} className="flex-1 h-11 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg shadow-rose-100 transition-all">
              نعم، احذف
            </Button>
            <Button onClick={onCancel} variant="ghost" className="flex-1 h-11 rounded-2xl text-slate-500 hover:bg-slate-100 font-bold">
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; groupId: number; groupName: string }>({
    open: false, groupId: 0, groupName: "",
  });

  const [form, setForm] = useState({
    groupName: "",
    groupLevel: "0",
    permissionIds: [] as string[],
  });

  const { toast } = useToast();

  // دالة موحدة لاستخراج الرسالة من الباك إند
  const getServerMessage = (res: any) => {
    // جلب الرسالة في حالة النجاح أو الفشل بناءً على هيكلية الـ API لديك
    return res?.data?.message || res?.message || res?.response?.data?.message || "تمت العملية بنجاح";
  };

  const getErrorMessage = (err: any) => {
    if (err?.response?.data?.errors) return err.response.data.errors.join(", ");
    return err?.response?.data?.message || err?.response?.data?.error || "حدث خطأ في النظام";
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [g, p] = await Promise.all([groupApi.getAll(), permissionApi.getAll()]);
      setGroups(Array.isArray(g) ? g : []);
      setPermissions(Array.isArray(p) ? p : []);
    } catch (err: any) {
      toast({ 
        title: "خطأ في الجلب",
        description: getErrorMessage(err), 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (group: Group) => {
    setEditing(group);
    const currentIds = permissions
      .filter(p => group.permissions?.includes(p.permissionName))
      .map(p => String(p.permissionId));
    setForm({ groupName: group.groupName, groupLevel: String(group.groupLevel || "0"), permissionIds: currentIds });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ groupName: "", groupLevel: "0", permissionIds: [] });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        groupName: form.groupName,
        groupLevel: Number(form.groupLevel),
        permissionIds: form.permissionIds,
      };

      if (editing) {
        const res = await groupApi.update({ ...payload, groupId: editing.groupId });
        
        // عرض رسالة النجاح القادمة من الباك إند
        toast({
          description: (
            <div className="flex items-center gap-3 font-black text-indigo-900" dir="rtl">
              <CheckCircle2 className="text-emerald-500" size={20} />
              <span>{getServerMessage(res)}</span>
            </div>
          )
        });
      } else {
        const res = await groupApi.create(payload);
        
        toast({
          description: (
            <div className="flex items-center gap-3 font-black text-indigo-900" dir="rtl">
              <CheckCircle2 className="text-emerald-500" size={20} />
              <span>{getServerMessage(res)}</span>
            </div>
          )
        });
      }

      await fetchData(); // تحديث القائمة من السيرفر لضمان دقة البيانات
      setDialogOpen(false);

    } catch (err: any) {
      // عرض رسالة الخطأ القادمة من الباك إند (مثل خطأ المستوى 100)
      toast({ 
        title: "فشل الإجراء",
        description: getErrorMessage(err), 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await groupApi.delete(deleteDialog.groupId);
      toast({ 
        description: (
          <div className="flex items-center gap-3 font-black text-rose-900" dir="rtl">
            <Trash2 className="text-rose-500" size={20} />
            <span>{getServerMessage(res)}</span>
          </div>
        )
      });
      await fetchData();
    } catch (err: any) {
      toast({ 
        title: "فشل الحذف",
        description: getErrorMessage(err), 
        variant: "destructive" 
      });
    } finally {
      setDeleteDialog({ open: false, groupId: 0, groupName: "" });
    }
  };

  const togglePermission = (id: string) => {
    setForm(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id)
        ? prev.permissionIds.filter(pId => pId !== id)
        : [...prev.permissionIds, id],
    }));
  };

  return (
    <div className="space-y-10 text-right pb-10" dir="rtl">
      <DeleteConfirmDialog
        open={deleteDialog.open}
        groupName={deleteDialog.groupName}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, groupId: 0, groupName: "" })}
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-800">إدارة المجموعات</h1>
          <p className="text-indigo-500 text-[10px] font-black mt-1 uppercase italic underline underline-offset-4">التحكم في مستويات الوصول</p>
        </div>
        <Button onClick={openCreate} className="h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl gap-3 px-8 font-black text-white transition-all hover:-translate-y-1">
          <Plus size={20} /> إضافة مجموعة
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {groups.map(group => (
              <motion.div
                layout
                key={group.groupId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white border border-slate-100 rounded-[3rem] p-8 hover:shadow-2xl transition-all relative group"
              >
                <div className="flex justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                    {group.groupName === "SuperAdmin" ? <Lock size={24} /> : <Shield size={24} />}
                  </div>
                  <Badge className="rounded-full bg-slate-100 text-slate-600 border-none font-black px-4 py-1">
                    Level {group.groupLevel}
                  </Badge>
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-2">{group.groupName}</h3>
                <p className="text-xs text-slate-400 font-bold mb-8 uppercase tracking-widest">
                   {group.permissions?.length || 0} صلاحيات مفعلة
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={() => openEdit(group)}
                    variant="ghost"
                    className="flex-1 h-12 rounded-2xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-black gap-2 transition-all"
                  >
                    <Settings2 size={16} /> الإعدادات
                  </Button>
                  {group.groupName !== "SuperAdmin" && (
                    <Button
                      onClick={() => setDeleteDialog({ open: true, groupId: group.groupId, groupName: group.groupName })}
                      variant="ghost"
                      className="w-12 h-12 rounded-2xl text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Trash2 size={18} />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Form Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl p-0 border-none rounded-[3rem] overflow-hidden shadow-2xl">
          <DialogHeader className="p-8 bg-indigo-600 text-white text-right">
            <DialogTitle className="text-2xl font-black">
              {editing ? "تعديل المجموعة" : "إنشاء مجموعة جديدة"}
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-right">
                <Label className="text-[10px] font-black text-slate-400 uppercase">اسم المجموعة</Label>
                <Input
                  value={form.groupName}
                  onChange={e => setForm({ ...form, groupName: e.target.value })}
                  className="rounded-xl bg-slate-50 border-none font-bold h-11 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-[10px] font-black text-slate-400 uppercase">مستوى المجموعة (Level)</Label>
                <Input
                  type="number"
                  value={form.groupLevel}
                  onChange={e => setForm({ ...form, groupLevel: e.target.value })}
                  className="rounded-xl bg-slate-50 border-none font-bold h-11 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <Label className="text-sm font-black text-slate-800 mb-2 block">تحديد الصلاحيات</Label>
              <div className="grid grid-cols-1 gap-2">
                {permissions.map((perm) => (
                  <div
                    key={perm.permissionId}
                    onClick={() => togglePermission(String(perm.permissionId))}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      form.permissionIds.includes(String(perm.permissionId)) 
                      ? "border-indigo-500 bg-indigo-50/50" 
                      : "border-slate-50 bg-white hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={form.permissionIds.includes(String(perm.permissionId))} />
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700">{perm.displayName}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{perm.permissionName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 flex-row-reverse">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-12 px-10 bg-indigo-600 font-black rounded-2xl flex-1 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              {saving ? <Loader2 className="animate-spin" /> : editing ? "حفظ التغييرات" : "إنشاء المجموعة"}
            </Button>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="h-12 px-6 font-bold text-slate-400">إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}