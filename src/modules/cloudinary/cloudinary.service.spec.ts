import { ConfigService } from '@nestjs/config'

import type { UploadFile } from '@/common/types'

import { CloudinaryService } from './cloudinary.service'

const mockCloudinaryConfig = jest.fn()
const mockCloudinaryDestroy = jest.fn()
const mockCloudinaryUploadStream = jest.fn()
const mockCreateReadStream = jest.fn()
const mockPipe = jest.fn()

jest.mock('cloudinary', () => ({
  v2: {
    config: (...args: unknown[]) => mockCloudinaryConfig(...args),
    uploader: {
      destroy: (...args: unknown[]) => mockCloudinaryDestroy(...args),
      upload_stream: (...args: unknown[]) => mockCloudinaryUploadStream(...args)
    }
  }
}))

jest.mock('streamifier', () => ({
  __esModule: true,
  default: {
    createReadStream: (...args: unknown[]) => mockCreateReadStream(...args)
  }
}))

type ConfigServiceMock = {
  getOrThrow: jest.Mock
}

describe('CloudinaryService', () => {
  let configService: ConfigServiceMock
  let service: CloudinaryService

  beforeEach(() => {
    jest.clearAllMocks()

    configService = {
      getOrThrow: jest.fn((key: string) => {
        const values = {
          CLOUDINARY_API_KEY: 'api-key',
          CLOUDINARY_API_SECRET: 'api-secret',
          CLOUDINARY_CLOUD_NAME: 'cloud'
        }

        return values[key as keyof typeof values]
      })
    }

    mockCreateReadStream.mockReturnValue({ pipe: mockPipe })

    service = new CloudinaryService(configService as unknown as ConfigService)
  })

  it('configures cloudinary in constructor using env values', () => {
    expect(mockCloudinaryConfig).toHaveBeenCalledWith({
      api_key: 'api-key',
      api_secret: 'api-secret',
      cloud_name: 'cloud'
    })
  })

  it('uploadFromBuffer uploads stream and resolves cloudinary response', async () => {
    const response = {
      format: 'png',
      public_id: 'pub-1',
      resource_type: 'image',
      secure_url: 'https://cdn.example.com/pic.png'
    }
    const uploadStream = { id: 'upload-stream' }
    const file: UploadFile = {
      buffer: Buffer.from('file-content'),
      mimetype: 'image/png'
    }

    mockCloudinaryUploadStream.mockImplementationOnce(
      (
        _options: unknown,
        callback: (error: unknown, result?: unknown) => void
      ) => {
        callback(null, response)

        return uploadStream
      }
    )

    const result = await service.uploadFromBuffer(file, 55, '/avatars/')

    expect(mockCloudinaryUploadStream).toHaveBeenCalledWith(
      {
        folder: 'avatars/user-55',
        resource_type: 'auto'
      },
      expect.any(Function)
    )
    expect(mockCreateReadStream).toHaveBeenCalledWith(file.buffer)
    expect(mockPipe).toHaveBeenCalledWith(uploadStream)
    expect(result).toEqual(response)
  })

  it('uploadFromBuffer uses shared folder by default', async () => {
    const response = {
      format: 'jpeg',
      public_id: 'pub-2',
      resource_type: 'image',
      secure_url: 'https://cdn.example.com/default.jpg'
    }

    mockCloudinaryUploadStream.mockImplementationOnce(
      (
        _options: unknown,
        callback: (error: unknown, result?: unknown) => void
      ) => {
        callback(null, response)

        return {}
      }
    )

    await service.uploadFromBuffer(
      { buffer: Buffer.from('x'), mimetype: 'image/jpeg' },
      1
    )

    expect(mockCloudinaryUploadStream).toHaveBeenCalledWith(
      expect.objectContaining({ folder: 'shared/user-1' }),
      expect.any(Function)
    )
  })

  it('uploadFromBuffer rejects with fallback message when callback has no result', async () => {
    mockCloudinaryUploadStream.mockImplementationOnce(
      (
        _options: unknown,
        callback: (error: unknown, result?: unknown) => void
      ) => {
        callback({}, undefined)

        return {}
      }
    )

    await expect(
      service.uploadFromBuffer(
        { buffer: Buffer.from('x'), mimetype: 'image/jpeg' },
        1
      )
    ).rejects.toThrow(new Error('Cloudinary upload failed'))
  })

  it('delete resolves when cloudinary returns ok', async () => {
    mockCloudinaryDestroy.mockImplementationOnce(
      (
        _publicId: string,
        _options: unknown,
        callback: (error: unknown, result?: unknown) => void
      ) => {
        callback(null, { result: 'ok' })
      }
    )

    await expect(service.delete('pub-1', 'image/png')).resolves.toBeUndefined()
    expect(mockCloudinaryDestroy).toHaveBeenCalledWith(
      'pub-1',
      { resource_type: 'image' },
      expect.any(Function)
    )
  })

  it('delete resolves when cloudinary returns not found', async () => {
    mockCloudinaryDestroy.mockImplementationOnce(
      (
        _publicId: string,
        _options: unknown,
        callback: (error: unknown, result?: unknown) => void
      ) => {
        callback(null, { result: 'not found' })
      }
    )

    await expect(
      service.delete('pub-404', 'video/mp4')
    ).resolves.toBeUndefined()
    expect(mockCloudinaryDestroy).toHaveBeenCalledWith(
      'pub-404',
      { resource_type: 'video' },
      expect.any(Function)
    )
  })

  it('delete uses raw resource type for unknown mime types', async () => {
    mockCloudinaryDestroy.mockImplementationOnce(
      (
        _publicId: string,
        _options: unknown,
        callback: (error: unknown, result?: unknown) => void
      ) => {
        callback(null, { result: 'ok' })
      }
    )

    await service.delete('pub-raw', 'application/pdf')

    expect(mockCloudinaryDestroy).toHaveBeenCalledWith(
      'pub-raw',
      { resource_type: 'raw' },
      expect.any(Function)
    )
  })

  it('delete rejects when cloudinary returns unexpected delete result', async () => {
    mockCloudinaryDestroy.mockImplementationOnce(
      (
        _publicId: string,
        _options: unknown,
        callback: (error: unknown, result?: unknown) => void
      ) => {
        callback(null, { result: 'error' })
      }
    )

    await expect(service.delete('pub-bad', 'image/png')).rejects.toThrow(
      new Error('Failed to delete file: pub-bad')
    )
  })

  it('delete rejects with fallback message when cloudinary error is unknown shape', async () => {
    mockCloudinaryDestroy.mockImplementationOnce(
      (
        _publicId: string,
        _options: unknown,
        callback: (error: unknown, result?: unknown) => void
      ) => {
        callback({}, undefined)
      }
    )

    await expect(service.delete('pub-x', 'image/png')).rejects.toThrow(
      new Error('Cloudinary delete failed')
    )
  })
})
