# دليل النشر على Vercel + MongoDB Atlas

## الخطوة 1: إنشاء قاعدة بيانات MongoDB Atlas

1. افتح **https://cloud.mongodb.com** وسجل دخول
2. اضغط **"Build a Database"** ← اختر **Free (M0)**
3. اختر مزود السحابة (AWS) والمنطقة الأقرب لك
4. سمّ الـ Cluster: `matanikeh`
5. اضغط **Create**

### إعداد المستخدم:
6. في Database Access ← Add New Database User:
   - Username: `matanikeh_user`
   - Password: اختر كلمة مرور قوية (احفظها)
   - Role: **Atlas Admin**
   - اضغط Add User

### السماح بالوصول:
7. في Network Access ← Add IP Address:
   - اضغط **"Allow Access from Anywhere"** (0.0.0.0/0)
   - هذا مطلوب لـ Vercel Serverless

### الحصول على Connection String:
8. في Clusters ← اضغط **Connect** ← **"Connect your application"**
9. انسخ الـ URI مثل:
   ```
   mongodb+srv://matanikeh_user:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## الخطوة 2: تحديث .env.local

عدّل ملف `.env.local` وضع الـ URI الحقيقي:
```
MONGODB_URI=mongodb+srv://matanikeh_user:كلمة_المرور@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=matanikeh
```

## الخطوة 3: رفع البيانات إلى MongoDB (Seed)

```bash
cd C:\matanikeh
npm run seed
```

سترى:
```
✅ Members: 4 inserted
✅ Exercises: XX inserted
✅ WODs: XX inserted
...
🎉 Seed complete!
```

## الخطوة 4: رفع الكود إلى GitHub

```bash
cd C:\matanikeh
git init
git add .
git commit -m "Initial commit - مجموعة المطانيخ CrossFit Platform"
git branch -M main
git remote add origin https://github.com/USERNAME/matanikeh.git
git push -u origin main
```

> أنشئ الـ repository على https://github.com/new أولاً (اسمه: matanikeh، Private)

## الخطوة 5: نشر على Vercel

1. افتح **https://vercel.com** وسجل دخول بـ GitHub
2. اضغط **"Add New Project"**
3. اختر repository `matanikeh`
4. في **Environment Variables** أضف:
   - `MONGODB_URI` = (نفس القيمة من .env.local)
   - `MONGODB_DB` = `matanikeh`
   - `ANTHROPIC_API_KEY` = (مفتاحك الموجود في .env.local)
   - `JWT_SECRET` = (اختر قيمة عشوائية آمنة مثل: `xK9mP2qR8vL5nJ3wT7yA1cE4fH6iO0`)
5. اضغط **Deploy**

بعد 2-3 دقائق ستحصل على رابط مثل: `https://matanikeh.vercel.app`

## الخطوة 6: تحديث MONGODB_URI بعد النشر

بعد أول نشر، تأكد أن الإعدادات تعمل بزيارة:
- `/login` ← سجل دخول بـ admin/admin123
- `/dashboard` ← تحقق أن كل شيء يعمل

---

## ملاحظات مهمة

- **لا ترفع `.env.local`** إلى GitHub (محمي في .gitignore)
- **لا ترفع مجلد `data/`** بعد الـ seed (يحتوي على passwords)
- المنصة جاهزة للاستخدام بعد النشر فوراً
- MongoDB Atlas المجاني يدعم حتى 512MB من البيانات
