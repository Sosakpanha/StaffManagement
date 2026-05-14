using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using StaffManagement.Api.Data.Interfaces;
using StaffManagement.Api.Entities;
using StaffManagement.Api.Enums;
using StaffManagement.Api.Exceptions;
using StaffManagement.Api.Models.Requests.Staff;
using StaffManagement.Api.Repositories.Interfaces;

namespace StaffManagement.Api.Repositories;

public sealed class StaffRepository : IStaffRepository
{
	private readonly IDbConnectionFactory _connectionFactory;

	public StaffRepository(IDbConnectionFactory connectionFactory)
	{
		_connectionFactory = connectionFactory;
	}

	public async Task<Staff?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
	{
		await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

		var command = new CommandDefinition(
			commandText: "dbo.GetStaffById",
			parameters: new { Id = id },
			commandType: CommandType.StoredProcedure,
			cancellationToken: cancellationToken);

		return await connection.QuerySingleOrDefaultAsync<Staff>(command);
	}

	public async Task<Staff> CreateAsync(StaffCreateRequest request, CancellationToken cancellationToken = default)
	{
		await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

		var command = new CommandDefinition(
			commandText: "dbo.CreateStaff",
			parameters: new
			{
				request.StaffId,
				request.FullName,
				request.Birthday,
				request.Gender
			},
			commandType: CommandType.StoredProcedure,
			cancellationToken: cancellationToken);

		try
		{
			return await connection.QuerySingleAsync<Staff>(command);
		}
		catch (SqlException ex)
		{
			throw TranslateSqlException(ex);
		}
	}

	public async Task<Staff> UpdateAsync(Guid id, StaffUpdateRequest request, CancellationToken cancellationToken = default)
	{
		await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

		var command = new CommandDefinition(
			commandText: "dbo.UpdateStaff",
			parameters: new
			{
				Id = id,
				request.StaffId,
				request.FullName,
				request.Birthday,
				request.Gender
			},
			commandType: CommandType.StoredProcedure,
			cancellationToken: cancellationToken);

		try
		{
			return await connection.QuerySingleAsync<Staff>(command);
		}
		catch (SqlException ex)
		{
			throw TranslateSqlException(ex);
		}
	}

	public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
	{
		await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

		var command = new CommandDefinition(
			commandText: "dbo.DeleteStaff",
			parameters: new { Id = id },
			commandType: CommandType.StoredProcedure,
			cancellationToken: cancellationToken);

		try
		{
			await connection.ExecuteAsync(command);
		}
		catch (SqlException ex)
		{
			throw TranslateSqlException(ex);
		}
	}

	public async Task<(IReadOnlyList<Staff> Items, int TotalCount)> SearchAsync(StaffSearchRequest request, CancellationToken cancellationToken = default)
	{
		await using var connection = await _connectionFactory.CreateOpenConnectionAsync(cancellationToken);

		var parameters = new DynamicParameters();
		parameters.Add("@StaffId",      request.StaffId,      DbType.String,   size: 8);
		parameters.Add("@Gender",       request.Gender,       DbType.Byte);
		parameters.Add("@BirthdayFrom", request.BirthdayFrom, DbType.Date);
		parameters.Add("@BirthdayTo",   request.BirthdayTo,   DbType.Date);
		parameters.Add("@FullName",     request.FullName,     DbType.String,   size: 100);
		parameters.Add("@Page",         request.Page,         DbType.Int32);
		parameters.Add("@PageSize",     request.PageSize,     DbType.Int32);
		parameters.Add("@SortBy",       request.SortBy,       DbType.String,   size: 20);
		parameters.Add("@SortDir",      request.SortDir,      DbType.String,   size: 4);
		parameters.Add("@TotalCount",   dbType: DbType.Int32, direction: ParameterDirection.Output);

		var command = new CommandDefinition(
			commandText: "dbo.SearchStaff",
			parameters: parameters,
			commandType: CommandType.StoredProcedure,
			cancellationToken: cancellationToken);

		var items = (await connection.QueryAsync<Staff>(command)).AsList();
		var total = parameters.Get<int>("@TotalCount");

		return (items, total);
	}

	private static ApiException TranslateSqlException(SqlException ex) => ex.Number switch
	{
		50001 => new ApiException(EnumApiError.DuplicateStaffId, "Staff with this StaffId already exists.", ex),
		50404 => new ApiException(EnumApiError.StaffNotFound,    "Staff not found.",                       ex),
		_     => new ApiException(EnumApiError.UnknownError,     "Database error.",                         ex)
	};
}
