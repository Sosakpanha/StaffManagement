using System.Data.Common;
using Microsoft.Data.SqlClient;
using StaffManagement.Api.Data.Interfaces;

namespace StaffManagement.Api.Data;

public sealed class SqlConnectionFactory : IDbConnectionFactory
{
	private readonly string _connectionString;

	public SqlConnectionFactory(string connectionString)
	{
		if (string.IsNullOrWhiteSpace(connectionString))
		{
			throw new ArgumentException("Connection string must be provided.", nameof(connectionString));
		}

		_connectionString = connectionString;
	}

	public async Task<DbConnection> CreateOpenConnectionAsync(CancellationToken cancellationToken = default)
	{
		var connection = new SqlConnection(_connectionString);
		await connection.OpenAsync(cancellationToken);
		return connection;
	}
}
