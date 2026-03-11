export default function IconContainer({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl p-2.5 inline-flex items-center justify-center shadow-sm ${className}`}>
      {children}
    </div>
  );
}
