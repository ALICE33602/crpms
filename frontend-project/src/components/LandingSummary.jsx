export default function LandingSummary() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Vehicle Registration & Management',
      desc: 'Easily register every customer vehicle by capturing plate number, car type, model, manufacturing year, and driver contact details. Each car is assigned to a specific mechanic for accountability and seamless tracking.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Service Catalogue & Pricing',
      desc: 'Define and manage a complete catalogue of repair and maintenance services with unique service codes, detailed descriptions, and accurate pricing. Keep everything organised and always up to date.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Service Records & History',
      desc: 'Link every service performed to a specific vehicle. Record service dates, amounts paid, and payment statuses — whether Paid, Pending, or Partial. Maintain a full, auditable history for every car that comes through the workshop.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Payment Tracking & Receipts',
      desc: 'Process and track every payment transaction with ease. Record who received the payment, issue receipts to customers, and generate comprehensive reports to keep the business finances transparent and under control.',
    },
  ];

  return (
    <div className="bg-black/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-gray-100 w-full border border-white/10">
      <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/10">
        <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">SmartPark CRPMS</h2>
          <p className="text-sm text-white/50">Car Repair & Parking Management System</p>
        </div>
      </div>

      <div className="space-y-4 text-sm text-white/60 leading-relaxed mb-6">
        <p>
          SmartPark CRPMS is a purpose-built digital platform designed exclusively for <strong className="text-white/80">SmartPark Company</strong> — an innovative organisation dedicated to delivering professional car repair and parking management services to its valued customers.
        </p>
        <p>
          This system empowers the <strong className="text-white/80">company manager</strong> who, in the past, struggled with the overwhelming burden of manually preparing and organising paperwork. Managing customer registrations, tracking vehicles, recording services, issuing receipts, and keeping financial records in order was a tedious and error-prone process that consumed valuable time and energy.
        </p>
        <p>
          With SmartPark CRPMS, the manager can now <strong className="text-white/80">register new customers and their vehicles</strong> effortlessly, <strong className="text-white/80">assign qualified mechanics</strong> to each job, <strong className="text-white/80">record every service performed</strong> with accurate pricing and payment status, and most importantly, <strong className="text-white/80">generate professional receipts</strong> for every payment collected from customers. The entire workflow is streamlined, automated, and accessible from a single, intuitive dashboard.
        </p>
      </div>

      <ul className="space-y-4">
        {features.map((f, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex-shrink-0 mt-0.5 w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white/40">
              {f.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white/90">{f.title}</p>
              <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-5 border-t border-white/10">
        <p className="text-xs text-white/40 italic text-center">
          "Bringing order, efficiency, and professionalism to every repair and parking operation."
        </p>
      </div>
    </div>
  );
}
