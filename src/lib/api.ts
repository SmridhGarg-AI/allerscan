import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export const apiResponse = {
  success: <T>(data: T, status = 200) => {
    return NextResponse.json<ApiResponse<T>>(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  },
  error: (message: string, status = 400) => {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  },
};
