export interface Bill {
    data: BookingData
    previousPage: any
    nextPage: any
    currentPage: number
    totalData: number
}

export interface BookingData {
    id: number
    paymentMethod: string
    paymentStatus: string
    amount: number
    createdAt: string
    updatedAt: string
    bookings: Booking[]
    user: User
}
  
export interface Booking {
    id: number
    startDate: string
    startTime: string
    endTime: string
    playTime: number
    cancelTime: string
    checkInTime: any
    checkOutTime: any
    statusBooking: string
    totalPrice: number
    notes: string
    createdAt: string
    updatedAt: string
    court: Court
}
  
export interface Court {
    id: number
    isVip: boolean
    images: Image[]
}
  
export interface Image {
    imgageUrl: string
    imageId: string
}

export interface User {
    id: number
    avatar: any
    fullName: string
    email: string
    phoneNumber: string
}
  
export type BookingDataByUser = Omit<Booking, 'user'>