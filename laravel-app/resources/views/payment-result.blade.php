<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نتیجه پرداخت</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap');
        body {
            font-family: 'Vazirmatn', sans-serif;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen flex items-center justify-center p-4">

<div class="w-full max-w-md">
    <!-- Status Icon -->
    <div class="flex justify-center mb-6">
        @if($verified)
            <div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200 animate-pulse">
                <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
        @else
            <div class="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-200 animate-pulse">
                <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </div>
        @endif
    </div>

    <!-- Receipt Card -->
    <div class="bg-white rounded-3xl shadow-xl overflow-hidden">

        <!-- Header -->
        <div class="bg-gradient-to-l {{ $verified ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600' }} p-6 text-white text-center">
            <h1 class="text-2xl font-bold mb-1">
                {{ $verified ? 'پرداخت موفق' : 'پرداخت ناموفق' }}
            </h1>
            <p class="text-sm opacity-90">شماره قبض: {{ $bill->bill_number }}</p>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-4">

            <!-- Status Message -->
            @if($verified)
                <div class="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                    <p class="text-green-800 text-sm">
                        پرداخت شما با موفقیت انجام شد و تراکنش ثبت گردید.
                    </p>
                </div>
            @else
                <div class="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                    <p class="text-red-800 text-sm">
                        متأسفانه پرداخت شما با خطا مواجه شد. لطفاً مجدداً تلاش کنید.
                    </p>
                </div>
            @endif

            <!-- Amount -->
            <div class="text-center py-6 bg-slate-50 rounded-2xl">
                <p class="text-sm text-slate-600 mb-2">مبلغ {{ $verified ? 'پرداخت شده' : 'قابل پرداخت' }}</p>
                <p class="text-4xl font-bold text-slate-800">
                    {{ number_format($bill->total_price) }}
                    <span class="text-xl text-slate-600">تومان</span>
                </p>
            </div>

            <!-- Items -->
            @if($bill->items->count() > 0)
                <div class="space-y-2">
                    <p class="text-xs text-slate-500 font-medium mb-3">اقلام خریداری شده</p>
                    @foreach($bill->items as $item)
                        <div class="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-xl">
                            <span class="text-sm text-slate-700">{{ $item->title ?? 'قلم ' . $loop->iteration }}</span>
                            <span class="text-sm font-semibold text-slate-800">{{ number_format($item->price) }} تومان</span>
                        </div>
                    @endforeach
                </div>
            @endif

            <!-- Details -->
            <div class="pt-4 space-y-3 border-t border-slate-200">

                <div class="flex justify-between text-sm">
                    <span class="text-slate-600">وضعیت</span>
                    <span class="font-medium {{ $verified ? 'text-green-600' : 'text-red-600' }}">
                            {{ $verified ? 'تأیید شده' : 'تأیید نشده' }}
                        </span>
                </div>

                @if($verified && $bill->paid_at)
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-600">تاریخ پرداخت</span>
                        <span class="text-slate-800 font-medium">{{ \Morilog\Jalali\Jalalian::fromDateTime($bill->paid_at)->format('Y/m/d H:i') }}</span>
                    </div>
                @endif

                @if($bill->user)
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-600">پرداخت کننده</span>
                        <span class="text-slate-800 font-medium">{{ $bill->user->name }}</span>
                    </div>
                @endif

                @if($verified && $bill->transactions->isNotEmpty())
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-600">کد پیگیری</span>
                        <span class="text-slate-800 font-medium">{{ $bill->transactions->first()->tracking_code ?? '-' }}</span>
                    </div>
                @endif
            </div>

        </div>

        <!-- Footer Button -->
        <div class="p-6 pt-0">
            <a href="{{env("FRONTEND_URL")}}/fa/panel/bills/{{$bill->id}}" id="nextButton" class="block w-full bg-gradient-to-l {{ $verified ? 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : 'from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800' }} text-white text-center py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg">
                {{ $verified ? 'ادامه' : 'تلاش مجدد' }}
            </a>
        </div>

    </div>

    <!-- Footer Text -->
    <p class="text-center text-sm text-slate-500 mt-6">
        {{ $verified ? 'با تشکر از پرداخت شما' : 'در صورت کسر وجه، مبلغ ظرف ۷۲ ساعت بازگردانده می‌شود' }}
    </p>
</div>

</body>
</html>
