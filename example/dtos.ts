import { IsString, IsNumber, IsBoolean, IsOptional } from "class-validator";

export class Book {
  @IsNumber()
  id: number;

  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsBoolean()
  available: boolean;

  constructor(
    id: number,
    title: string,
    author: string,
    available: boolean = true,
  ) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.available = available;
  }
}

export class CreateBookInput {
  @IsString()
  title: string;

  @IsString()
  author: string;
}

export class UpdateBookInput {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}

export class GetBookInput {
  @IsNumber()
  id: number;
}

export class Rental {
  @IsNumber()
  id: number;

  @IsNumber()
  bookId: number;

  @IsString()
  renterName: string;

  @IsString()
  rentDate: string; // ISO string

  @IsOptional()
  @IsString()
  returnDate?: string;

  constructor(
    id: number,
    bookId: number,
    renterName: string,
    rentDate: string,
    returnDate?: string,
  ) {
    this.id = id;
    this.bookId = bookId;
    this.renterName = renterName;
    this.rentDate = rentDate;
    this.returnDate = returnDate;
  }
}

export class RentBookInput {
  @IsNumber()
  bookId: number;

  @IsString()
  renterName: string;
}

export class ReturnBookInput {
  @IsNumber()
  rentalId: number;
}

export class BookList {
  books: Book[];
}

export class RentalList {
  rentals: Rental[];
}

export class EmptyInput {}
