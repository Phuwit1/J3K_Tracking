// app/track/[trackingCode]/layout.js
export async function generateMetadata({ params }) {
    const { trackingCode } = await params;  // รอการคืนค่าของ params ก่อนที่จะใช้
    
    return {
      title: `ติดตามพัสดุ ${trackingCode}`,
      description: `ติดตามตำแหน่งการส่งพัสดุ ${trackingCode}`,
    };
  }
  
  export default function TrackingLayout({ children }) {
    return children;
  }